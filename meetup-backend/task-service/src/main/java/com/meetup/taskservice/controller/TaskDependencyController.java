package com.meetup.taskservice.controller;

import com.meetup.taskservice.dto.request.TaskDependencyCreateDto;
import com.meetup.taskservice.dto.request.TaskDependencyUpdateDto;
import com.meetup.taskservice.dto.response.TaskDependencyResponseDto;
import com.meetup.taskservice.service.TaskDependencyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tasks/{taskId}/dependencies")
@RequiredArgsConstructor
public class TaskDependencyController {

    private final TaskDependencyService dependencyService;

    @GetMapping
    public ResponseEntity<List<TaskDependencyResponseDto>> getDependencies(@PathVariable UUID taskId) {
        return ResponseEntity.ok(dependencyService.getDependencies(taskId));
    }

    @PostMapping
    public ResponseEntity<TaskDependencyResponseDto> createDependency(@PathVariable UUID taskId,
                                                                      @RequestBody @Valid TaskDependencyCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(dependencyService.createDependency(taskId, dto));
    }

    @PutMapping("/{dependencyId}")
    public ResponseEntity<TaskDependencyResponseDto> updateDependency(@PathVariable UUID taskId,
                                                                      @PathVariable UUID dependencyId,
                                                                      @RequestBody @Valid TaskDependencyUpdateDto dto) {
        return ResponseEntity.ok(dependencyService.updateDependency(taskId, dependencyId, dto));
    }

    @DeleteMapping("/{dependencyId}")
    public ResponseEntity<Void> deleteDependency(@PathVariable UUID taskId,
                                                 @PathVariable UUID dependencyId) {
        dependencyService.deleteDependency(taskId, dependencyId);
        return ResponseEntity.noContent().build();
    }
}
