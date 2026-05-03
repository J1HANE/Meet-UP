package com.meetup.taskservice.service;

import com.meetup.taskservice.domain.entity.Task;
import com.meetup.taskservice.domain.entity.TaskBlock;
import com.meetup.taskservice.dto.request.TaskBlockCreateDto;
import com.meetup.taskservice.dto.request.TaskBlockResolveDto;
import com.meetup.taskservice.dto.response.TaskBlockResponseDto;
import com.meetup.taskservice.exception.EntityNotFoundException;
import com.meetup.taskservice.mapper.TaskBlockMapper;
import com.meetup.taskservice.repository.TaskBlockRepository;
import com.meetup.taskservice.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TaskBlockService {
    private final TaskBlockRepository taskBlockRepository;
    private final TaskRepository taskRepository;
    private final TaskBlockMapper taskBlockMapper;

    public List<TaskBlockResponseDto> getBlocks(UUID taskId) {
        return taskBlockRepository.findByTask_TaskId(taskId)
                .stream()
                .map(taskBlockMapper::toResponseDto)
                .toList();
    }

    public TaskBlockResponseDto createBlock(UUID taskId, TaskBlockCreateDto dto) {
        Task task = taskRepository.findById(taskId).orElseThrow(
                () -> new EntityNotFoundException("Task not found with ID: " + taskId));

        TaskBlock block = taskBlockMapper.toEntity(dto);
        block.setTask(task);

        return taskBlockMapper.toResponseDto(taskBlockRepository.save(block));
    }

    public TaskBlockResponseDto resolveBlock(UUID taskId, UUID blockId, TaskBlockResolveDto dto) {
        TaskBlock block = taskBlockRepository.findById(blockId).orElseThrow(
                () -> new EntityNotFoundException("Block not found with ID: " + blockId));

        if (block.getUnblockedAt() != null) {
            throw new IllegalStateException("Block with ID " + blockId + " is already resolved");
        }

        taskBlockMapper.resolveBlock(dto, block);
        return taskBlockMapper.toResponseDto(taskBlockRepository.save(block));
    }

    public void deleteBlock(UUID taskId, UUID blockId) {
        if (!taskBlockRepository.existsById(blockId)) {
            throw new EntityNotFoundException("Block not found with ID: " + blockId);
        }
        taskBlockRepository.deleteById(blockId);
    }
}
