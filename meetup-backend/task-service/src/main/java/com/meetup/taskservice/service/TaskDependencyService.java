package com.meetup.taskservice.service;

import com.meetup.taskservice.domain.entity.Task;
import com.meetup.taskservice.domain.entity.TaskDependency;
import com.meetup.taskservice.domain.entity.TaskDependencyId;
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

    public List<TaskDependencyResponseDto> getDependencies(String contextId, UUID taskId) {
        findTask(contextId, taskId);
        return dependencyRepository.findByTask_TaskId(taskId)
                .stream()
                .map(dependencyMapper::toResponseDto)
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

        return dependencyMapper.toResponseDto(dependencyRepository.save(dependency));
    }

    public TaskDependencyResponseDto updateDependency(String contextId, UUID taskId, UUID dependencyId, TaskDependencyUpdateDto dto) {
        findTask(contextId, taskId);
        findTask(contextId, dependencyId);
        TaskDependency dependency = findDependency(taskId,  dependencyId);
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

    public void deleteDependency(String contextId, UUID taskId, UUID dependencyId) {
        findTask(contextId, taskId);
        findTask(contextId, dependencyId);
        TaskDependencyId taskDependencyId = new TaskDependencyId();
        taskDependencyId.setTaskId(taskId);
        taskDependencyId.setDependsOnTaskId(dependencyId);
        if (!dependencyRepository.existsById(taskDependencyId)) {
            throw new EntityNotFoundException("Dependency not found with ID: " + dependencyId);
        }
        dependencyRepository.deleteById(taskDependencyId);
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
