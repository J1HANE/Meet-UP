package com.meetup.taskservice.service;



import com.meetup.taskservice.domain.entity.*;

import com.meetup.taskservice.domain.enums.*;
import com.meetup.taskservice.dto.*;
import com.meetup.taskservice.dto.request.TaskCreateDto;
import com.meetup.taskservice.dto.request.TaskUpdateDto;
import com.meetup.taskservice.dto.response.TaskResponseDto;
import com.meetup.taskservice.exception.EntityNotFoundException;
import com.meetup.taskservice.mapper.TaskMapper;
import com.meetup.taskservice.repository.CategoryRepository;
import com.meetup.taskservice.repository.TagRepository;
import com.meetup.taskservice.repository.TaskDependencyRepository;
import com.meetup.taskservice.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final TaskMapper taskMapper;
    private final TaskDependencyRepository taskDependencyRepository;
    private final TaskDependencyService taskDependencyService;


    @Transactional(readOnly = true)
    public List<TaskResponseDto> getTasks(String contextId) {
        return taskRepository.findByContextId(contextId)
                .stream()
                .map(taskMapper::toResponseDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TaskDetailDto> getSnapshot(String contextId) {
        return taskRepository.findByContextId(contextId)
                .stream()
                .map(taskMapper::toDetailDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public TaskResponseDto getTaskById(String contextId, UUID id) {
        return taskMapper.toResponseDto(findTask(contextId, id));
    }

    @Transactional
    public TaskResponseDto createTask(String contextId, TaskCreateDto taskCreateDto) {
        Task newTask = taskMapper.toEntity(taskCreateDto);
        newTask.setContextId(contextId);

        //Resolve categoryId to Category entity
        if(taskCreateDto.getCategoryId() != null) {
            Category taskCategory = categoryRepository.findById(taskCreateDto.getCategoryId()).orElseThrow(
                    () -> new EntityNotFoundException("Category not found with ID: " + taskCreateDto.getCategoryId())
            );

            newTask.setCategory(taskCategory);
        }

        //Resolve parentTaskId to Task
        if(taskCreateDto.getParentTaskId() != null) {
            Task task = taskRepository.findById(taskCreateDto.getParentTaskId()).orElseThrow(
                    () -> new EntityNotFoundException("Task not found with ID: " + taskCreateDto.getParentTaskId()));

            newTask.setParentTask(task);
        }


        //Resolve tags through relationship
        if(taskCreateDto.getTagIds() != null && !taskCreateDto.getTagIds().isEmpty()) {
            Set<Tag> tags = new HashSet<>();
            taskCreateDto.getTagIds().forEach(tagId -> {
               Tag tag = tagRepository.findById(tagId).orElseThrow(
                       () -> new EntityNotFoundException("Tag not found with ID: " + tagId)
               );

               tags.add(tag);
            });

            newTask.setTags(tags);
        }

        Task savedTask = taskRepository.save(newTask);

        //Resolve dependencies through relationships
        if(taskCreateDto.getDependencyIds() != null && !taskCreateDto.getDependencyIds().isEmpty()) {
            taskCreateDto.getDependencyIds().forEach(dependencyId -> {
                Task dependsOnTask  = taskRepository.findById(dependencyId).orElseThrow(
                        () -> new EntityNotFoundException("Task not found with ID: " + dependencyId));


                TaskDependencyId id = new TaskDependencyId();
                id.setTaskId(savedTask.getTaskId());
                id.setDependsOnTaskId(dependencyId);

                TaskDependency dependency = new TaskDependency();
                dependency.setId(id);
                dependency.setTask(savedTask);
                dependency.setDependsOnTask(dependsOnTask);
                dependency.setDependencyType(DependencyType.FINISH_TO_START);

                savedTask.getDependencies().add(dependency);

            });
            //TODO: must uncomment this line if it will be possible to create a task in a different state either than "IN_BACKLOG"
//            applyStatusTimestamp(savedTask, taskCreateDto.);
            taskRepository.save(savedTask);
        }

        return taskMapper.toResponseDto(savedTask);
    }

    @Transactional
    public TaskResponseDto updateTask(String contextId, UUID id, TaskUpdateDto taskUpdateDto) {
        Task task = findTask(contextId, id);

        boolean hasChanges = false;

        if (taskUpdateDto.getTaskName() != null && !taskUpdateDto.getTaskName().equals(task.getTaskName())) {
            task.setTaskName(taskUpdateDto.getTaskName());
            hasChanges = true;
        }

        if (taskUpdateDto.getTaskDescription() != null && !taskUpdateDto.getTaskDescription().equals(task.getTaskDescription())) {
            task.setTaskDescription(taskUpdateDto.getTaskDescription());
            hasChanges = true;
        }

        if (taskUpdateDto.getPriority() != null && !taskUpdateDto.getPriority().equals(task.getPriority())) {
            task.setPriority(taskUpdateDto.getPriority());
            hasChanges = true;
        }

        if (taskUpdateDto.getVisibility() != null && !taskUpdateDto.getVisibility().equals(task.getVisibility())) {
            task.setVisibility(taskUpdateDto.getVisibility());
            hasChanges = true;
        }

        if (taskUpdateDto.getStartDate() != null && !taskUpdateDto.getStartDate().equals(task.getStartDate())) {
            task.setStartDate(taskUpdateDto.getStartDate());
            hasChanges = true;
        }

        if (taskUpdateDto.getEndDate() != null && !taskUpdateDto.getEndDate().equals(task.getEndDate())) {
            task.setEndDate(taskUpdateDto.getEndDate());
            hasChanges = true;
        }

        if (taskUpdateDto.getBaselineStart() != null && !taskUpdateDto.getBaselineStart().equals(task.getBaselineStart())) {
            task.setBaselineStart(taskUpdateDto.getBaselineStart());
            hasChanges = true;
        }

        if (taskUpdateDto.getBaselineEnd() != null && !taskUpdateDto.getBaselineEnd().equals(task.getBaselineEnd())) {
            task.setBaselineEnd(taskUpdateDto.getBaselineEnd());
            hasChanges = true;
        }

        if (taskUpdateDto.getEstimatedHours() != null && !taskUpdateDto.getEstimatedHours().equals(task.getEstimatedHours())) {
            task.setEstimatedHours(taskUpdateDto.getEstimatedHours());
            hasChanges = true;
        }

        if (taskUpdateDto.getActualHours() != null && !taskUpdateDto.getActualHours().equals(task.getActualHours())) {
            task.setActualHours(taskUpdateDto.getActualHours());
            hasChanges = true;
        }

        if (taskUpdateDto.getPoints() != null && !taskUpdateDto.getPoints().equals(task.getPoints())) {
            task.setPoints(taskUpdateDto.getPoints());
            hasChanges = true;
        }

        if (taskUpdateDto.getAssignedTo() != null && !taskUpdateDto.getAssignedTo().equals(task.getAssignedTo())) {
            task.setAssignedTo(taskUpdateDto.getAssignedTo());
            hasChanges = true;
        }

        if (taskUpdateDto.getReviewedBy() != null && !taskUpdateDto.getReviewedBy().equals(task.getReviewedBy())) {
            task.setReviewedBy(taskUpdateDto.getReviewedBy());
            hasChanges = true;
        }

        if (taskUpdateDto.getRecurrenceInterval() != null && !taskUpdateDto.getRecurrenceInterval().equals(task.getRecurrenceInterval())) {
            task.setRecurrenceInterval(taskUpdateDto.getRecurrenceInterval());
            hasChanges = true;
        }

        if (!hasChanges) {
            return taskMapper.toResponseDto(task);
        }

        return taskMapper.toResponseDto(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(String contextId, UUID id) {
        findTask(contextId, id);
        taskRepository.deleteById(id);
    }


    @Transactional(readOnly = true)
    public TaskDetailDto getTaskDetail(String contextId, UUID taskId) {
        return taskMapper.toDetailDto(findTask(contextId, taskId));
    }



    //Tags
    @Transactional
    public TaskResponseDto addTag(String contextId, UUID taskId, UUID tagId) {
        Task task = findTask(contextId, taskId);
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new EntityNotFoundException("Tag not found with ID: " + tagId));
        task.getTags().add(tag);
        touch(task);
        return taskMapper.toResponseDto(taskRepository.save(task));
    }

    @Transactional
    public TaskResponseDto removeTag(String contextId, UUID taskId, UUID tagId) {
        Task task = findTask(contextId, taskId);
        boolean removed = task.getTags().removeIf(t -> t.getTagId().equals(tagId));
        if (!removed) throw new EntityNotFoundException("Tag not found on this task with ID: " + tagId);
        touch(task);
        return taskMapper.toResponseDto(taskRepository.save(task));
    }

    @Transactional
    public TaskResponseDto replaceTags(String contextId, UUID taskId, Set<UUID> tagIds) {
        Task task = findTask(contextId, taskId);
        Set<Tag> newTags = tagIds.stream()
                .map(tid -> tagRepository.findById(tid)
                        .orElseThrow(() -> new EntityNotFoundException("Tag not found with ID: " + tid)))
                .collect(Collectors.toSet());
        task.setTags(newTags);
        touch(task);
        return taskMapper.toResponseDto(taskRepository.save(task));
    }


    //Sub tasks
    public List<TaskSummaryDto> getSubTasks(String contextId, UUID taskId) {
        return findTask(contextId, taskId).getSubTasks()
                .stream()
                .map(taskMapper::toSummaryDto)
                .toList();
    }


    public TaskDependencySummaryDto getDependencySummary(String contextId, UUID taskId) {
        findTask(contextId, taskId); // ensure task exists
        List<TaskDependency> blockedBy = taskDependencyRepository.findByTask_TaskId(taskId);
        List<TaskDependency> blocking  = taskDependencyRepository.findByDependsOnTask_TaskId(taskId);
        return new TaskDependencySummaryDto(
                blockedBy.stream().map(d -> d.getDependsOnTask().getTaskId()).toList(),
                blocking.stream().map(d -> d.getTask().getTaskId()).toList()
        );
    }




    // Assignee
    @Transactional
    public TaskResponseDto assign(String contextId, UUID id, String assignedTo, AssignedToType assignedToType) {
        Task task = findTask(contextId, id);
        task.setAssignedTo(assignedTo);
        task.setAssignedToType(assignedToType != null ? assignedToType : AssignedToType.PERSON);
        task.setAssignedAt(OffsetDateTime.now());
        touch(task);
        return taskMapper.toResponseDto(taskRepository.save(task));
    }

    @Transactional
    public TaskResponseDto unassign(String contextId, UUID id) {
        Task task = findTask(contextId, id);
        task.setAssignedTo(null);
        task.setAssignedAt(null);
        touch(task);
        return taskMapper.toResponseDto(taskRepository.save(task));
    }


    // Patch Operations

    @Transactional
    public TaskResponseDto updatePriority(String contextId, UUID id, TaskPriority priority) {
        Task task = findTask(contextId, id);
        if (priority.equals(task.getPriority())) return taskMapper.toResponseDto(task);
        task.setPriority(priority);
        touch(task);
        return taskMapper.toResponseDto(taskRepository.save(task));
    }

    @Transactional
    public TaskResponseDto updatePoints(String contextId, UUID id, Short points) {
        Task task = findTask(contextId, id);
        if (points != null && points < 0) throw new IllegalArgumentException("Points cannot be negative");
        if (Objects.equals(points, task.getPoints())) return taskMapper.toResponseDto(task);
        task.setPoints(points);
        touch(task);
        return taskMapper.toResponseDto(taskRepository.save(task));
    }

    public TaskResponseDto updateTaskName(String contextId, UUID id, String name) {

        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Task name must not be blank");
        }
        name = name.trim();
        if (name.length() > 255) {
            throw new IllegalArgumentException("Task name must not exceed 255 characters");
        }

        name = name.replaceAll("<[^>]*>", "")
                .replaceAll("\\p{Cntrl}&&[^\t]", "");
        Task task = findTask(contextId, id);
        task.setTaskName(name);
        touch(task);

        return taskMapper.toResponseDto(taskRepository.save(task));
    }

    @Transactional
    public TaskResponseDto updateReviewer(String contextId, UUID id, String reviewedBy) {
        Task task = findTask(contextId, id);
        if (Objects.equals(reviewedBy, task.getReviewedBy())) return taskMapper.toResponseDto(task);
        task.setReviewedBy(reviewedBy);
        touch(task);
        return taskMapper.toResponseDto(taskRepository.save(task));
    }

    @Transactional
    public TaskResponseDto toggleMilestone(String contextId, UUID id) {
        Task task = findTask(contextId, id);
        task.setMilestone(!task.isMilestone());
        touch(task);
        return taskMapper.toResponseDto(taskRepository.save(task));
    }

    @Transactional
    public TaskResponseDto setMilestone(String contextId, UUID id, boolean isMilestone) {
        Task task = findTask(contextId, id);
        if (task.isMilestone() == isMilestone) return taskMapper.toResponseDto(task);
        task.setMilestone(isMilestone);
        touch(task);
        return taskMapper.toResponseDto(taskRepository.save(task));
    }

    @Transactional
    public TaskResponseDto updateRecurrence(String contextId, UUID id, RecurrenceInterval interval) {
        Task task = findTask(contextId, id);
        if (interval == null) {
            task.setRecurring(false);
            task.setRecurrenceInterval(null);
        } else {
            task.setRecurring(true);
            task.setRecurrenceInterval(interval);
        }
        touch(task);
        return taskMapper.toResponseDto(taskRepository.save(task));
    }

    @Transactional
    public TaskResponseDto updateDates(String contextId, UUID id, TaskDatesDto dto) {
        Task task = findTask(contextId, id);
        if (dto.getStartDate() != null)     task.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null)        task.setEndDate(dto.getEndDate());
        if (dto.getBaselineStart() != null)  task.setBaselineStart(dto.getBaselineStart());
        if (dto.getBaselineEnd() != null)    task.setBaselineEnd(dto.getBaselineEnd());
        validateDateRange(task);
        touch(task);
        return taskMapper.toResponseDto(taskRepository.save(task));
    }


    @Transactional
    public TaskResponseDto updateHours(String contextId, UUID id, TaskHoursDto dto) {
        Task task = findTask(contextId, id);
        if (dto.getEstimatedHours() != null) task.setEstimatedHours(dto.getEstimatedHours());
        if (dto.getActualHours() != null)    task.setActualHours(dto.getActualHours());
        touch(task);
        return taskMapper.toResponseDto(taskRepository.save(task));
    }


    @Transactional
    public TaskResponseDto updateProgress(String contextId, UUID id, short progressPercent) {
        if (progressPercent < 0 || progressPercent > 100)
            throw new IllegalArgumentException("Progress must be between 0 and 100");
        Task task = findTask(contextId, id);
        task.setProgressPercent(progressPercent);
        touch(task);
        return taskMapper.toResponseDto(taskRepository.save(task));
    }


    @Transactional
    public TaskResponseDto updateVisibility(String contextId, UUID id, TaskVisibility visibility) {
        Task task = findTask(contextId, id);
        if (visibility.equals(task.getVisibility())) return taskMapper.toResponseDto(task);
        task.setVisibility(visibility);
        touch(task);
        return taskMapper.toResponseDto(taskRepository.save(task));
    }


    @Transactional
    public TaskResponseDto updateStatus(String contextId, UUID id, TaskStatus status) {
        Task task = findTask(contextId, id);
        if (status.equals(task.getStatus())) return taskMapper.toResponseDto(task);
        task.setStatus(status);
        applyStatusTimestamp(task, status);
        touch(task);

        Task saved = taskRepository.save(task);

        // Notify dependency service so downstream block records get resolved
        taskDependencyService.handleUpstreamStatusChange(saved);

        return taskMapper.toResponseDto(saved);
    }

    @Transactional
    public TaskResponseDto toggleRequiresReview(String contextId, UUID id) {
        Task task = findTask(contextId, id);
        task.setRequiresReview(!task.isRequiresReview());
        touch(task);
        return taskMapper.toResponseDto(taskRepository.save(task));
    }

    @Transactional
    public TaskResponseDto updateCategory(String contextId, UUID taskId, UUID categoryId) {
        Task task = findTask(contextId, taskId);
        if (categoryId == null) {
            task.setCategory(null);
        } else {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new EntityNotFoundException("Category not found with ID: " + categoryId));
            task.setCategory(category);
        }
        touch(task);
        return taskMapper.toResponseDto(taskRepository.save(task));
    }


    //Statistics
    public TaskStatsDto getTaskStats(String contextId, UUID id) {
        Task task = findTask(contextId, id);

        long totalSubTasks     = task.getSubTasks().size();
        long completedSubTasks = task.getSubTasks().stream()
                .filter(t -> t.getStatus() == TaskStatus.COMPLETED).count();
        long blockedByCount    = task.getDependencies().size();
        long blockingCount     = task.getDependents().size();

        BigDecimal variance = null;
        if (task.getEstimatedHours() != null && task.getActualHours() != null) {
            variance = task.getActualHours().subtract(task.getEstimatedHours());
        }

        Duration age = Duration.between(task.getCreatedAt(), OffsetDateTime.now());

        return TaskStatsDto.builder()
                .taskId(id)
                .progressPercent(task.getProgressPercent())
                .totalSubTasks(totalSubTasks)
                .completedSubTasks(completedSubTasks)
                .subTaskCompletionRate(totalSubTasks == 0 ? null
                        : BigDecimal.valueOf(completedSubTasks * 100.0 / totalSubTasks)
                        .setScale(1, RoundingMode.HALF_UP))
                .estimatedHours(task.getEstimatedHours())
                .actualHours(task.getActualHours())
                .hoursVariance(variance)
                .blockedByCount(blockedByCount)
                .blockingCount(blockingCount)
                .tagCount((long) task.getTags().size())
                .ageInDays(age.toDays())
                .isOverdue(task.getEndDate() != null
                        && task.getEndDate().isBefore(LocalDate.now())
                        && task.getStatus() != TaskStatus.COMPLETED)
                .createdAt(task.getCreatedAt())
                .assignedAt(task.getAssignedAt())
                .startedAt(task.getStartedAt())
                .completedAt(task.getCompletedAt())
                .build();
    }


    // Helper functions
    private Task findTask(String contextId, UUID taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with ID: " + taskId));
        if (!task.getContextId().equals(contextId)) {
            throw new EntityNotFoundException("Task not found with ID: " + taskId);
        }
        return task;
    }


    private void touch(Task task) {
        task.setLastActivityAt(OffsetDateTime.now());
    }

    private void validateDateRange(Task task) {
        if (task.getStartDate() != null && task.getEndDate() != null
                && task.getEndDate().isBefore(task.getStartDate())) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }
    }




    private void applyStatusTimestamp(Task task, TaskStatus status) {
        OffsetDateTime now = OffsetDateTime.now();
        switch (status) {
            case IN_PROGRESS -> { task.setStartedAt(now); task.setStartDate(LocalDate.now()); }
            case COMPLETED   -> { task.setCompletedAt(now); task.setEndDate(LocalDate.now()); }
            case CANCELLED   -> task.setCancelledAt(now);
            case IN_REVIEW   -> task.setSubmittedAt(now);
            case BLOCKED     -> task.setBlockedAt(now);
            case ASSIGNED    -> task.setAssignedAt(now);
            default          -> {}
        }
    }
}
