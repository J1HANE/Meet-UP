package com.meetup.taskservice.controller;


import com.meetup.taskservice.dto.*;
import com.meetup.taskservice.dto.patch.*;
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

    @GetMapping("/{id}/detail")
    public ResponseEntity<TaskDetailDto> getTaskDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(taskService.getTaskDetail(id));
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<TaskStatsDto> getTaskStats(@PathVariable UUID id) {
        return ResponseEntity.ok(taskService.getTaskStats(id));
    }

    @GetMapping("/{id}/subtasks")
    public ResponseEntity<List<TaskSummaryDto>> getSubTasks(@PathVariable UUID id) {
        return ResponseEntity.ok(taskService.getSubTasks(id));
    }

    @GetMapping("/{id}/dependencies/summary")
    public ResponseEntity<TaskDependencySummaryDto> getDependencySummary(@PathVariable UUID id) {
        return ResponseEntity.ok(taskService.getDependencySummary(id));
    }




    @PostMapping
    public ResponseEntity<TaskResponseDto> createTask(@RequestBody @Valid TaskCreateDto taskCreateDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(taskCreateDto));
    }

    @PostMapping("/{id}/tags/{tagId}")
    public ResponseEntity<TaskResponseDto> addTag(
            @PathVariable UUID id,
            @PathVariable UUID tagId) {
        return ResponseEntity.ok(taskService.addTag(id, tagId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponseDto> updateTask(@PathVariable UUID id,
                                                      @RequestBody @Valid TaskUpdateDto taskUpdateDto) {
        return ResponseEntity.ok(taskService.updateTask(id, taskUpdateDto));
    }

    @PutMapping("/{id}/tags")
    public ResponseEntity<TaskResponseDto> replaceTags(
            @PathVariable UUID id,
            @RequestBody @Valid TagsPatchDto dto) {
        return ResponseEntity.ok(taskService.replaceTags(id, dto.tagIds()));
    }


    //Patch Operations
    @PatchMapping("/{id}/points")
    public ResponseEntity<TaskResponseDto> updatePoints(
            @PathVariable UUID id,
            @RequestBody @Valid PointsPatchDto dto) {
        return ResponseEntity.ok(taskService.updatePoints(id, dto.points()));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<TaskResponseDto> assign(
            @PathVariable UUID id,
            @RequestBody @Valid AssignPatchDto dto) {
        return ResponseEntity.ok(taskService.assign(id, dto.assignedTo(), dto.assignedToType()));
    }

    @PatchMapping("/{id}/reviewer")
    public ResponseEntity<TaskResponseDto> updateReviewer(
            @PathVariable UUID id,
            @RequestBody @Valid ReviewerPatchDto dto) {
        return ResponseEntity.ok(taskService.updateReviewer(id, dto.reviewedBy()));
    }

    @PatchMapping("/{id}/milestone")
    public ResponseEntity<TaskResponseDto> setMilestone(
            @PathVariable UUID id,
            @RequestBody @Valid MilestonePatchDto dto) {
        return ResponseEntity.ok(taskService.setMilestone(id, dto.isMilestone()));
    }

    @PatchMapping("/{id}/milestone/toggle")
    public ResponseEntity<TaskResponseDto> toggleMilestone(@PathVariable UUID id) {
        return ResponseEntity.ok(taskService.toggleMilestone(id));
    }

    @PatchMapping("/{id}/recurrence")
    public ResponseEntity<TaskResponseDto> updateRecurrence(
            @PathVariable UUID id,
            @RequestBody @Valid RecurrencePatchDto dto) {
        return ResponseEntity.ok(taskService.updateRecurrence(id, dto.interval()));
    }

    @PatchMapping("/{id}/dates")
    public ResponseEntity<TaskResponseDto> updateDates(
            @PathVariable UUID id,
            @RequestBody @Valid TaskDatesDto dto) {
        return ResponseEntity.ok(taskService.updateDates(id, dto));
    }

    @PatchMapping("/{id}/hours")
    public ResponseEntity<TaskResponseDto> updateHours(
            @PathVariable UUID id,
            @RequestBody @Valid TaskHoursDto dto) {
        return ResponseEntity.ok(taskService.updateHours(id, dto));
    }

    @PatchMapping("/{id}/progress")
    public ResponseEntity<TaskResponseDto> updateProgress(
            @PathVariable UUID id,
            @RequestBody @Valid ProgressPatchDto dto) {
        return ResponseEntity.ok(taskService.updateProgress(id, dto.progressPercent()));
    }

    @PatchMapping("/{id}/visibility")
    public ResponseEntity<TaskResponseDto> updateVisibility(
            @PathVariable UUID id,
            @RequestBody @Valid VisibilityPatchDto dto) {
        return ResponseEntity.ok(taskService.updateVisibility(id, dto.visibility()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponseDto> updateStatus(
            @PathVariable UUID id,
            @RequestBody @Valid StatusPatchDto dto) {
        return ResponseEntity.ok(taskService.updateStatus(id, dto.status()));
    }

    @PatchMapping("/{id}/requires-review/toggle")
    public ResponseEntity<TaskResponseDto> toggleRequiresReview(@PathVariable UUID id) {
        return ResponseEntity.ok(taskService.toggleRequiresReview(id));
    }

    @PatchMapping("/{id}/category")
    public ResponseEntity<TaskResponseDto> updateCategory(
            @PathVariable UUID id,
            @RequestBody CategoryPatchDto dto) {    // no @Valid, categoryId is optional
        return ResponseEntity.ok(taskService.updateCategory(id, dto.categoryId()));
    }


    @DeleteMapping("/{id}/assign")
    public ResponseEntity<TaskResponseDto> unassign(@PathVariable UUID id) {
        return ResponseEntity.ok(taskService.unassign(id));
    }
    @DeleteMapping("/{id}/tags/{tagId}")
    public ResponseEntity<TaskResponseDto> removeTag(
            @PathVariable UUID id,
            @PathVariable UUID tagId) {
        return ResponseEntity.ok(taskService.removeTag(id, tagId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
