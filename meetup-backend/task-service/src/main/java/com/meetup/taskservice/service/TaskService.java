package com.meetup.taskservice.service;



import com.meetup.taskservice.domain.entity.*;

import com.meetup.taskservice.domain.enums.DependencyType;
import com.meetup.taskservice.dto.request.TaskCreateDto;
import com.meetup.taskservice.dto.request.TaskUpdateDto;

import com.meetup.taskservice.dto.response.TaskResponseDto;
import com.meetup.taskservice.exception.EntityAlreadyExistsException;
import com.meetup.taskservice.exception.EntityNotFoundException;
import com.meetup.taskservice.mapper.TaskDependencyMapper;
import com.meetup.taskservice.mapper.TaskMapper;
import com.meetup.taskservice.repository.CategoryRepository;
import com.meetup.taskservice.repository.TagRepository;
import com.meetup.taskservice.repository.TaskDependencyRepository;
import com.meetup.taskservice.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final TaskMapper taskMapper;
    private final TaskDependencyRepository taskDependencyRepository;
    private final TaskDependencyService taskDependencyService;



    @Transactional
    public List<TaskResponseDto> getTasks() {
        return taskRepository.findAll()
                .stream()
                .map(taskMapper::toResponseDto)
                .toList();
    }

    public TaskResponseDto getTaskById(UUID id) {
        Task task = taskRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Task not found with ID: " + id));
        return taskMapper.toResponseDto(task);
    }

    @Transactional
    public TaskResponseDto createTask(TaskCreateDto taskCreateDto) {
        Task newTask = taskMapper.toEntity(taskCreateDto);


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

            taskRepository.save(savedTask);
        }

        return taskMapper.toResponseDto(savedTask);
    }

    public TaskResponseDto updateTask(UUID id, TaskUpdateDto taskUpdateDto) {
        Task task = taskRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Task not found with ID: " + id));

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

    public void deleteTask(UUID id) {
        if (!taskRepository.existsById(id)) {
            throw new EntityNotFoundException("Task not found with ID: " + id);
        }
        taskRepository.deleteById(id);
    }
}
