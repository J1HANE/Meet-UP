package com.meetup.taskservice.service;

import com.meetup.taskservice.domain.entity.Task;
import com.meetup.taskservice.domain.entity.TaskDependency;
import com.meetup.taskservice.dto.request.TaskDependencyCreateDto;
import com.meetup.taskservice.dto.request.TaskDependencyUpdateDto;
import com.meetup.taskservice.dto.response.TaskDependencyResponseDto;
import com.meetup.taskservice.exception.EntityAlreadyExistsException;
import com.meetup.taskservice.exception.EntityNotFoundException;
import com.meetup.taskservice.mapper.TaskDependencyMapper;
import com.meetup.taskservice.repository.TaskDependencyRepository;
import com.meetup.taskservice.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskDependencyService {
    private final TaskDependencyRepository dependencyRepository;
    private final TaskRepository taskRepository;
    private final TaskDependencyMapper dependencyMapper;

    public List<TaskDependencyResponseDto> getDependencies(UUID taskId) {
        return dependencyRepository.findByTask_TaskId(taskId)
                .stream()
                .map(dependencyMapper::toResponseDto)
                .toList();
    }

    public TaskDependencyResponseDto createDependency(UUID taskId, TaskDependencyCreateDto dto) {
        Task task = taskRepository.findById(taskId).orElseThrow(
                () -> new EntityNotFoundException("Task not found with ID: " + taskId));
        Task dependsOnTask = taskRepository.findById(dto.getDependsOnTaskId()).orElseThrow(
                () -> new EntityNotFoundException("Depends-on task not found with ID: " + dto.getDependsOnTaskId()));

        if (dependencyRepository.existsByTask_TaskIdAndDependsOnTask_TaskId(taskId, dto.getDependsOnTaskId())) {
            throw new EntityAlreadyExistsException("Dependency already exists between these tasks");
        }

        TaskDependency dependency = dependencyMapper.toEntity(dto);
        dependency.setTask(task);
        dependency.setDependsOnTask(dependsOnTask);

        return dependencyMapper.toResponseDto(dependencyRepository.save(dependency));
    }

    public TaskDependencyResponseDto updateDependency(UUID taskId, UUID dependencyId, TaskDependencyUpdateDto dto) {
        TaskDependency dependency = dependencyRepository.findById(dependencyId).orElseThrow(
                () -> new EntityNotFoundException("Dependency not found with ID: " + dependencyId));

        boolean hasChanges = false;

        if (dto.getDependencyType() != null && !dto.getDependencyType().equals(dependency.getDependencyType())) {
            dependency.setDependencyType(dto.getDependencyType());
            hasChanges = true;
        }
        if (dto.getLagDays() != dependency.getLagDays()) {
            dependency.setLagDays(dto.getLagDays());
            hasChanges = true;
        }

        if (!hasChanges) {
            return dependencyMapper.toResponseDto(dependency);
        }

        return dependencyMapper.toResponseDto(dependencyRepository.save(dependency));
    }

    public void deleteDependency(UUID taskId, UUID dependencyId) {
        if (!dependencyRepository.existsById(dependencyId)) {
            throw new EntityNotFoundException("Dependency not found with ID: " + dependencyId);
        }
        dependencyRepository.deleteById(dependencyId);
    }
}
