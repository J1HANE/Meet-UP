package com.meetup.taskservice.controller;


import com.meetup.taskservice.dto.request.TaskCreateDto;
import com.meetup.taskservice.dto.request.TaskUpdateDto;
import com.meetup.taskservice.dto.response.TaskResponseDto;
import com.meetup.taskservice.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskResponseDto>> getTasks() {
        return ResponseEntity.ok(taskService.getTasks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponseDto> getTaskById(@PathVariable UUID id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PostMapping
    public ResponseEntity<TaskResponseDto> createTask(@RequestBody @Valid TaskCreateDto taskCreateDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(taskCreateDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponseDto> updateTask(@PathVariable UUID id,
                                                      @RequestBody @Valid TaskUpdateDto taskUpdateDto) {
        return ResponseEntity.ok(taskService.updateTask(id, taskUpdateDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
