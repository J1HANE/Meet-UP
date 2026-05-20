package com.meetup.taskservice.service;

import com.meetup.taskservice.domain.entity.Task;
import com.meetup.taskservice.domain.entity.TaskBlock;
import com.meetup.taskservice.domain.entity.TaskDependency;
import com.meetup.taskservice.domain.entity.TaskDependencyId;
import com.meetup.taskservice.domain.enums.DependencyType;
import com.meetup.taskservice.domain.enums.TaskStatus;
import com.meetup.taskservice.dto.BlockingDependencyDto;
import com.meetup.taskservice.dto.request.TaskDependencyCreateDto;
import com.meetup.taskservice.dto.request.TaskDependencyUpdateDto;
import com.meetup.taskservice.dto.response.TaskBlockResponseDto;
import com.meetup.taskservice.dto.response.TaskDependencyResponseDto;
import com.meetup.taskservice.exception.EntityAlreadyExistsException;
import com.meetup.taskservice.exception.EntityNotFoundException;
import com.meetup.taskservice.mapper.TaskBlockMapper;
import com.meetup.taskservice.mapper.TaskDependencyMapper;
import com.meetup.taskservice.repository.TaskBlockRepository;
import com.meetup.taskservice.repository.TaskDependencyRepository;
import com.meetup.taskservice.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskDependencyService {
    private final TaskDependencyRepository dependencyRepository;
    private final TaskRepository taskRepository;
    private final TaskBlockRepository taskBlockRepository;
    private final TaskDependencyMapper dependencyMapper;
    private final TaskBlockMapper taskBlockMapper;

    public List<TaskDependencyResponseDto> getDependencies(String contextId, UUID taskId) {
        findTask(contextId, taskId);
        return dependencyRepository.findByTask_TaskId(taskId)
                .stream()
                .map(dependencyMapper::toResponseDto)
                .toList();
    }

    public List<TaskBlockResponseDto> getBlockHistory(String contextId, UUID taskId) {
        findTask(contextId, taskId);
        return taskBlockRepository.findByTask_TaskId(taskId)
                .stream()
                .map(taskBlockMapper::toResponseDto)
                .toList();
    }

    public List<BlockingDependencyDto> getBlockingDependencies(String contextId, UUID taskId) {
        findTask(contextId, taskId);
        return dependencyRepository.findByTask_TaskId(taskId)
                .stream()
                .filter(this::isBlocking)
                .map(dep -> new BlockingDependencyDto(
                        dep.getDependsOnTask().getTaskId(),
                        dep.getDependsOnTask().getTaskName(),
                        dep.getDependsOnTask().getStatus(),
                        dep.getDependencyType(),
                        resolveBlockReason(dep)
                ))
                .toList();
    }





    public TaskDependencyResponseDto createDependency(String contextId, UUID taskId, TaskDependencyCreateDto dto) {
        Task task = findTask(contextId, taskId);
        Task dependsOnTask = findTask(contextId, dto.getDependsOnTaskId());

        if (dependencyRepository.existsByTask_TaskIdAndDependsOnTask_TaskId(taskId, dto.getDependsOnTaskId())) {
            throw new EntityAlreadyExistsException("Dependency already exists between these tasks");
        }

        TaskDependency dependency = dependencyMapper.toEntity(dto);
        dependency.setId(new TaskDependencyId());
        dependency.setTask(task);
        dependency.setDependsOnTask(dependsOnTask);

        TaskDependency savedDependency = dependencyRepository.save(dependency);

        if (isBlocking(savedDependency)) {
            openBlockRecord(task, dependsOnTask, savedDependency);
        }

        return dependencyMapper.toResponseDto(savedDependency);
    }

    public TaskDependencyResponseDto updateDependency(String contextId, UUID taskId, UUID dependencyId, TaskDependencyUpdateDto dto) {
        findTask(contextId, taskId);
        findTask(contextId, dependencyId);
        TaskDependency dependency = findDependency(taskId, dependencyId);
        boolean hasChanges = false;

        if (dto.getDependencyType() != null && !dto.getDependencyType().equals(dependency.getDependencyType())) {
            dependency.setDependencyType(dto.getDependencyType());
            hasChanges = true;
        }
        if (dto.getLagDays() != dependency.getLagDays()) {
            dependency.setLagDays(dto.getLagDays());
            hasChanges = true;
        }

        if (!hasChanges) return dependencyMapper.toResponseDto(dependency);

        return dependencyMapper.toResponseDto(dependencyRepository.save(dependency));
    }

    public void deleteDependency(String contextId, UUID taskId, UUID dependencyId) {
        findTask(contextId, taskId);
        findTask(contextId, dependencyId);
        TaskDependencyId taskDependencyId = new TaskDependencyId();
        taskDependencyId.setTaskId(taskId);
        taskDependencyId.setDependsOnTaskId(dependencyId);
        if (!dependencyRepository.existsById(taskDependencyId)) {
            throw new EntityNotFoundException("Dependency not found with ID: " + dependencyId);
        }

        // Close any open block record before removing the dependency
        TaskDependency dep = findDependency(taskId, dependencyId);
        if (isBlocking(dep)) {
            resolveOpenBlockRecord(dep.getTask(), dep.getDependsOnTask());
        }

        dependencyRepository.deleteById(taskDependencyId);
    }

    /**
     * Called by TaskService when a task's status changes.
     * Resolves any open block records where that task was the blocker.
     */
    public void handleUpstreamStatusChange(Task upstreamTask) {
        List<TaskDependency> downstreamDeps =
                dependencyRepository.findByDependsOnTask_TaskId(upstreamTask.getTaskId());

        for (TaskDependency dep : downstreamDeps) {
            if (!isBlocking(dep)) {
                resolveOpenBlockRecord(dep.getTask(), upstreamTask);
            }
        }
    }


    public Map<UUID, List<BlockingDependencyDto>> getBlockingByTaskIds(Collection<UUID> taskIds) {
        return dependencyRepository.findByTask_TaskIdIn(taskIds)
                .stream()
                .filter(this::isBlocking)
                .collect(Collectors.groupingBy(
                        dep -> dep.getTask().getTaskId(),
                        Collectors.mapping(dep -> new BlockingDependencyDto(
                                dep.getDependsOnTask().getTaskId(),
                                dep.getDependsOnTask().getTaskName(),
                                dep.getDependsOnTask().getStatus(),
                                dep.getDependencyType(),
                                resolveBlockReason(dep)
                        ), Collectors.toList())
                ));
    }





    public boolean isTaskBlocked(String contextId, UUID taskId) {
        findTask(contextId, taskId);
        return dependencyRepository.findByTask_TaskId(taskId)
                .stream()
                .anyMatch(this::isBlocking);
    }


    private boolean isBlocking(TaskDependency dep) {
        Task upstream = dep.getDependsOnTask();
        return switch (dep.getDependencyType()) {
            case FINISH_TO_START, FINISH_TO_FINISH -> upstream.getStatus() != TaskStatus.COMPLETED;
            case START_TO_START, START_TO_FINISH   -> upstream.getStartedAt() == null;
        };
    }

    private String resolveBlockReason(TaskDependency dep) {
        return switch (dep.getDependencyType()) {
            case FINISH_TO_START, FINISH_TO_FINISH ->
                    "Waiting for '" + dep.getDependsOnTask().getTaskName() + "' to be completed";
            case START_TO_START, START_TO_FINISH ->
                    "Waiting for '" + dep.getDependsOnTask().getTaskName() + "' to be started";
        };
    }


    private void resolveOpenBlockRecord(Task task, Task blockedByTask) {
        taskBlockRepository
                .findOpenByTask_TaskIdAndBlockedByTask_TaskId(
                        task.getTaskId(),
                        blockedByTask.getTaskId()
                )
                .ifPresent(block -> {
                    block.setUnblockedAt(OffsetDateTime.now());
                    taskBlockRepository.save(block);
                });
    }

    private void openBlockRecord(Task task, Task blockedByTask, TaskDependency dependency) {
        TaskBlock block = TaskBlock.builder()
                .task(task)
                .blockedByTask(blockedByTask)
                .dependencyType(dependency.getDependencyType())
                .reason(resolveBlockReason(dependency))
                .blockedAt(OffsetDateTime.now())
                .build();
        taskBlockRepository.save(block);
    }

    private TaskDependency findDependency(UUID taskId, UUID dependencyId){
        TaskDependencyId taskDependencyId = new TaskDependencyId();
        taskDependencyId.setTaskId(taskId);
        taskDependencyId.setDependsOnTaskId(dependencyId);

        return dependencyRepository.findById(taskDependencyId).orElseThrow(
                () -> new EntityNotFoundException("Dependency not found with ID: " + dependencyId));
    }

    private Task findTask(String contextId, UUID taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with ID: " + taskId));
        if (!task.getContextId().equals(contextId)) {
            throw new EntityNotFoundException("Task not found with ID: " + taskId);
        }
        return task;
    }
}
