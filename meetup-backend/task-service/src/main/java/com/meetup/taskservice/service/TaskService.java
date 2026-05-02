package com.meetup.taskservice.service;



import com.meetup.taskservice.domain.entity.Task;

import com.meetup.taskservice.dto.request.TaskCreateDto;
import com.meetup.taskservice.dto.request.TaskUpdateDto;

import com.meetup.taskservice.dto.response.TaskResponseDto;
import com.meetup.taskservice.exception.EntityNotFoundException;
import com.meetup.taskservice.mapper.TaskMapper;
import com.meetup.taskservice.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

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

    public TaskResponseDto createTask(TaskCreateDto taskCreateDto) {
        Task newTask = taskRepository.save(taskMapper.toEntity(taskCreateDto));
        return taskMapper.toResponseDto(newTask);
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
