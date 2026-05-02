package com.meetup.taskservice.controller;

import com.meetup.taskservice.dto.request.TaskBlockCreateDto;
import com.meetup.taskservice.dto.request.TaskBlockResolveDto;
import com.meetup.taskservice.dto.response.TaskBlockResponseDto;
import com.meetup.taskservice.service.TaskBlockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tasks/{taskId}/blocks")
@RequiredArgsConstructor
public class TaskBlockController {

    private final TaskBlockService taskBlockService;

    @GetMapping
    public ResponseEntity<List<TaskBlockResponseDto>> getBlocks(@PathVariable UUID taskId) {
        return ResponseEntity.ok(taskBlockService.getBlocks(taskId));
    }

    @PostMapping
    public ResponseEntity<TaskBlockResponseDto> createBlock(@PathVariable UUID taskId,
                                                            @RequestBody @Valid TaskBlockCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskBlockService.createBlock(taskId, dto));
    }

    @PatchMapping("/{blockId}/resolve")
    public ResponseEntity<TaskBlockResponseDto> resolveBlock(@PathVariable UUID taskId,
                                                             @PathVariable UUID blockId,
                                                             @RequestBody @Valid TaskBlockResolveDto dto) {
        return ResponseEntity.ok(taskBlockService.resolveBlock(taskId, blockId, dto));
    }

    @DeleteMapping("/{blockId}")
    public ResponseEntity<Void> deleteBlock(@PathVariable UUID taskId,
                                            @PathVariable UUID blockId) {
        taskBlockService.deleteBlock(taskId, blockId);
        return ResponseEntity.noContent().build();
    }
}
