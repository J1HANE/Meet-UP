package com.meetup.taskservice.service;

import com.meetup.taskservice.domain.entity.Task;
import com.meetup.taskservice.domain.enums.TaskStatus;
import com.meetup.taskservice.dto.gantt.GanttDependencyDto;
import com.meetup.taskservice.dto.gantt.GanttMetaDto;
import com.meetup.taskservice.dto.gantt.GanttResponseDto;
import com.meetup.taskservice.dto.gantt.GanttTaskDto;
import com.meetup.taskservice.mapper.GanttMapper;
import com.meetup.taskservice.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GanttService {

    private final TaskRepository taskRepository;
    private final GanttMapper ganttMapper;

    // ─────────────────────────────────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────────────────────────────────

    public GanttResponseDto getGanttData() {
        List<Task> allTasks = taskRepository.findAllWithRelations();
        return buildGantt(allTasks);
    }

    public GanttResponseDto getGanttDataByCategory(UUID categoryId) {
        List<Task> tasks = taskRepository.findAllWithRelationsByCategoryId(categoryId);
        return buildGantt(tasks);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Core builder
    // ─────────────────────────────────────────────────────────────────────────

    private GanttResponseDto buildGantt(List<Task> allTasks) {

        // 1. Identify critical-path task IDs
        Set<UUID> criticalPathIds = computeCriticalPath(allTasks);

        // 2. Flatten into ordered rows (parents before children, depth tracked)
        List<GanttTaskDto> rows = flattenToRows(allTasks, criticalPathIds);

        // 3. Collect dependency arrows
        List<GanttDependencyDto> deps = collectDependencies(allTasks);

        // 4. Compute chart-level meta
        GanttMetaDto meta = buildMeta(allTasks);

        return GanttResponseDto.builder()
                .meta(meta)
                .tasks(rows)
                .dependencies(deps)
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 1 — Critical path (longest path through dependency graph by duration)
    // ─────────────────────────────────────────────────────────────────────────

    private Set<UUID> computeCriticalPath(List<Task> tasks) {
        // Build adjacency: taskId → tasks that depend ON it (successors)
        Map<UUID, List<UUID>> successors = new HashMap<>();
        Map<UUID, List<UUID>> predecessors = new HashMap<>();
        Map<UUID, Task> taskMap = tasks.stream()
                .collect(Collectors.toMap(Task::getTaskId, t -> t));

        tasks.forEach(t -> {
            successors.put(t.getTaskId(), new ArrayList<>());
            predecessors.put(t.getTaskId(), new ArrayList<>());
        });

        tasks.forEach(t -> t.getDependencies().forEach(dep -> {
            UUID pred = dep.getDependsOnTask().getTaskId();
            UUID succ = t.getTaskId();
            successors.computeIfAbsent(pred, k -> new ArrayList<>()).add(succ);
            predecessors.computeIfAbsent(succ, k -> new ArrayList<>()).add(pred);
        }));

        // Forward pass — earliest finish (in days from project start)
        Map<UUID, Long> earlyFinish = new HashMap<>();
        tasks.forEach(t -> earlyFinish.put(t.getTaskId(), taskDuration(t)));

        // Topological order
        List<UUID> topoOrder = topologicalSort(tasks, predecessors);

        topoOrder.forEach(id -> {
            Task t = taskMap.get(id);
            long dur = taskDuration(t);
            long maxPredFinish = predecessors.getOrDefault(id, List.of()).stream()
                    .mapToLong(p -> earlyFinish.getOrDefault(p, 0L))
                    .max().orElse(0L);
            earlyFinish.put(id, maxPredFinish + dur);
        });

        // Project end = max earlyFinish
        long projectDuration = earlyFinish.values().stream().mapToLong(v -> v).max().orElse(0);

        // Backward pass — latest finish
        Map<UUID, Long> lateFinish = new HashMap<>();
        tasks.forEach(t -> lateFinish.put(t.getTaskId(), projectDuration));

        List<UUID> reversed = new ArrayList<>(topoOrder);
        Collections.reverse(reversed);

        reversed.forEach(id -> {
            long minSuccStart = successors.getOrDefault(id, List.of()).stream()
                    .mapToLong(s -> lateFinish.getOrDefault(s, projectDuration)
                            - taskDuration(taskMap.get(s)))
                    .min().orElse(projectDuration);
            lateFinish.put(id, minSuccStart + taskDuration(taskMap.get(id)));
        });

        // Float = lateFinish - earlyFinish; zero float → critical
        return tasks.stream()
                .filter(t -> {
                    long ef = earlyFinish.getOrDefault(t.getTaskId(), 0L);
                    long lf = lateFinish.getOrDefault(t.getTaskId(), 0L);
                    return (lf - ef) == 0 && taskDuration(t) > 0;
                })
                .map(Task::getTaskId)
                .collect(Collectors.toSet());
    }

    private long taskDuration(Task t) {
        if (t.getStartDate() == null || t.getEndDate() == null) return 0;
        return ChronoUnit.DAYS.between(t.getStartDate(), t.getEndDate());
    }

    private List<UUID> topologicalSort(List<Task> tasks, Map<UUID, List<UUID>> predecessors) {
        Map<UUID, Integer> inDegree = new HashMap<>();
        tasks.forEach(t -> inDegree.put(t.getTaskId(),
                predecessors.getOrDefault(t.getTaskId(), List.of()).size()));

        Queue<UUID> queue = new LinkedList<>();
        tasks.stream()
                .filter(t -> inDegree.get(t.getTaskId()) == 0)
                .forEach(t -> queue.add(t.getTaskId()));

        List<UUID> order = new ArrayList<>();
        Map<UUID, List<UUID>> successors = new HashMap<>();
        tasks.forEach(t -> t.getDependencies().forEach(dep ->
                successors.computeIfAbsent(dep.getDependsOnTask().getTaskId(),
                        k -> new ArrayList<>()).add(t.getTaskId())));

        while (!queue.isEmpty()) {
            UUID id = queue.poll();
            order.add(id);
            successors.getOrDefault(id, List.of()).forEach(succ -> {
                inDegree.merge(succ, -1, Integer::sum);
                if (inDegree.get(succ) == 0) queue.add(succ);
            });
        }
        return order;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 2 — Tree flattening (DFS, roots first)
    // ─────────────────────────────────────────────────────────────────────────

    private List<GanttTaskDto> flattenToRows(List<Task> allTasks, Set<UUID> criticalPathIds) {
        List<Task> roots = allTasks.stream()
                .filter(t -> t.getParentTask() == null)
                .toList();

        List<GanttTaskDto> rows = new ArrayList<>();
        roots.forEach(root -> dfs(root, 0, criticalPathIds, rows));
        return rows;
    }

    private void dfs(Task task, int depth, Set<UUID> criticalPathIds, List<GanttTaskDto> rows) {
        rows.add(ganttMapper.toGanttTaskDto(task, depth, criticalPathIds.contains(task.getTaskId())));
        task.getSubTasks().forEach(child -> dfs(child, depth + 1, criticalPathIds, rows));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 3 — Dependency arrows
    // ─────────────────────────────────────────────────────────────────────────

    private List<GanttDependencyDto> collectDependencies(List<Task> tasks) {
        return tasks.stream()
                .flatMap(t -> t.getDependencies().stream())
                .map(ganttMapper::toGanttDependencyDto)
                .toList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 4 — Meta
    // ─────────────────────────────────────────────────────────────────────────

    private GanttMetaDto buildMeta(List<Task> tasks) {
        List<Task> scheduled = tasks.stream()
                .filter(t -> t.getStartDate() != null && t.getEndDate() != null)
                .toList();

        LocalDate projectStart = scheduled.stream()
                .map(Task::getStartDate).min(Comparator.naturalOrder()).orElse(LocalDate.now());
        LocalDate projectEnd = scheduled.stream()
                .map(Task::getEndDate).max(Comparator.naturalOrder()).orElse(LocalDate.now());

        long completed = tasks.stream().filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        long overdue   = tasks.stream().filter(t ->
                t.getEndDate() != null
                        && t.getEndDate().isBefore(LocalDate.now())
                        && t.getStatus() != TaskStatus.COMPLETED).count();
        long milestones = tasks.stream().filter(Task::isMilestone).count();

        BigDecimal avgProgress = tasks.isEmpty() ? BigDecimal.ZERO
                : BigDecimal.valueOf(
                        tasks.stream().mapToInt(Task::getProgressPercent).average().orElse(0))
                .setScale(1, RoundingMode.HALF_UP);

        return GanttMetaDto.builder()
                .projectStart(projectStart)
                .projectEnd(projectEnd)
                .today(LocalDate.now())
                .totalTasks((long) tasks.size())
                .completedTasks(completed)
                .overdueTasks(overdue)
                .milestoneTasks(milestones)
                .overallProgressPercent(avgProgress)
                .build();
    }
}
