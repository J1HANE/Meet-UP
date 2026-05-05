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
@RequestMapping("/context/{contextId}/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<TaskResponseDto>> getTasks(@PathVariable String contextId) {
        return ResponseEntity.ok(taskService.getTasks(contextId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponseDto> getTaskById(@PathVariable String contextId, @PathVariable UUID id) {
        return ResponseEntity.ok(taskService.getTaskById(contextId, id));
    }

    @GetMapping("/{id}/detail")
    public ResponseEntity<TaskDetailDto> getTaskDetail(@PathVariable String contextId, @PathVariable UUID id) {
        return ResponseEntity.ok(taskService.getTaskDetail(contextId, id));
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<TaskStatsDto> getTaskStats(@PathVariable UUID id, @PathVariable String contextId) {
        return ResponseEntity.ok(taskService.getTaskStats(contextId,id));
    }

    @GetMapping("/{id}/subtasks")
    public ResponseEntity<List<TaskSummaryDto>> getSubTasks(@PathVariable UUID id, @PathVariable String contextId) {
        return ResponseEntity.ok(taskService.getSubTasks(contextId, id));
    }

    @GetMapping("/{id}/dependencies/summary")
    public ResponseEntity<TaskDependencySummaryDto> getDependencySummary(@PathVariable UUID id, @PathVariable String contextId) {
        return ResponseEntity.ok(taskService.getDependencySummary(contextId, id));
    }




    @PostMapping
    public ResponseEntity<TaskResponseDto> createTask(@RequestBody @Valid TaskCreateDto taskCreateDto, @PathVariable String contextId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(contextId,taskCreateDto));
    }

    @PostMapping("/{id}/tags/{tagId}")
    public ResponseEntity<TaskResponseDto> addTag(
            @PathVariable UUID id,
            @PathVariable UUID tagId,
            @PathVariable String contextId) {
        return ResponseEntity.ok(taskService.addTag(contextId,id, tagId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponseDto> updateTask(@PathVariable UUID id,
                                                      @PathVariable String contextId,
                                                      @RequestBody @Valid TaskUpdateDto taskUpdateDto) {
        return ResponseEntity.ok(taskService.updateTask(contextId, id, taskUpdateDto));
    }

    @PutMapping("/{id}/tags")
    public ResponseEntity<TaskResponseDto> replaceTags(
            @PathVariable UUID id,
            @RequestBody @Valid TagsPatchDto dto,
            @PathVariable String contextId) {
        return ResponseEntity.ok(taskService.replaceTags(contextId, id, dto.tagIds()));
    }


    //Patch Operations
    @PatchMapping("/{id}/points")
    public ResponseEntity<TaskResponseDto> updatePoints(
            @PathVariable UUID id,
            @RequestBody @Valid PointsPatchDto dto,
            @PathVariable String contextId) {
        return ResponseEntity.ok(taskService.updatePoints(contextId, id, dto.points()));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<TaskResponseDto> assign(
            @PathVariable UUID id,
            @RequestBody @Valid AssignPatchDto dto,
            @PathVariable String contextId) {
        return ResponseEntity.ok(taskService.assign(contextId, id, dto.assignedTo(), dto.assignedToType()));
    }

    @PatchMapping("/{id}/reviewer")
    public ResponseEntity<TaskResponseDto> updateReviewer(
            @PathVariable UUID id,
            @RequestBody @Valid ReviewerPatchDto dto,
            @PathVariable String contextId) {
        return ResponseEntity.ok(taskService.updateReviewer(contextId, id, dto.reviewedBy()));
    }

    @PatchMapping("/{id}/milestone")
    public ResponseEntity<TaskResponseDto> setMilestone(
            @PathVariable UUID id,
            @RequestBody @Valid MilestonePatchDto dto,
            @PathVariable String contextId) {
        return ResponseEntity.ok(taskService.setMilestone(contextId, id, dto.isMilestone()));
    }

    @PatchMapping("/{id}/milestone/toggle")
    public ResponseEntity<TaskResponseDto> toggleMilestone(@PathVariable UUID id,
                                                           @PathVariable String contextId) {
        return ResponseEntity.ok(taskService.toggleMilestone(contextId, id));
    }

    @PatchMapping("/{id}/recurrence")
    public ResponseEntity<TaskResponseDto> updateRecurrence(
            @PathVariable UUID id,
            @RequestBody @Valid RecurrencePatchDto dto,
            @PathVariable String contextId) {
        return ResponseEntity.ok(taskService.updateRecurrence(contextId, id, dto.interval()));
    }

    @PatchMapping("/{id}/dates")
    public ResponseEntity<TaskResponseDto> updateDates(
            @PathVariable UUID id,
            @RequestBody @Valid TaskDatesDto dto,
            @PathVariable String contextId) {
        return ResponseEntity.ok(taskService.updateDates(contextId, id, dto));
    }

    @PatchMapping("/{id}/hours")
    public ResponseEntity<TaskResponseDto> updateHours(
            @PathVariable UUID id,
            @RequestBody @Valid TaskHoursDto dto,
            @PathVariable String contextId) {
        return ResponseEntity.ok(taskService.updateHours(contextId, id, dto));
    }

    @PatchMapping("/{id}/progress")
    public ResponseEntity<TaskResponseDto> updateProgress(
            @PathVariable UUID id,
            @RequestBody @Valid ProgressPatchDto dto,
            @PathVariable String contextId) {
        return ResponseEntity.ok(taskService.updateProgress(contextId, id, dto.progressPercent()));
    }

    @PatchMapping("/{id}/visibility")
    public ResponseEntity<TaskResponseDto> updateVisibility(
            @PathVariable UUID id,
            @PathVariable String contextId,
            @RequestBody @Valid VisibilityPatchDto dto) {
        return ResponseEntity.ok(taskService.updateVisibility(contextId, id, dto.visibility()));
    }

    @PatchMapping("/{id}/priority")
    public ResponseEntity<TaskResponseDto> updatePriority(
            @PathVariable UUID id,
            @PathVariable String contextId,
            @RequestBody @Valid PriorityPatchDto dto) {
        return ResponseEntity.ok(taskService.updatePriority(contextId, id, dto.priority()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponseDto> updateStatus(
            @PathVariable UUID id,
            @PathVariable String contextId,
            @RequestBody @Valid StatusPatchDto dto) {
        return ResponseEntity.ok(taskService.updateStatus(contextId, id, dto.status()));
    }

    @PatchMapping("/{id}/requires-review/toggle")
    public ResponseEntity<TaskResponseDto> toggleRequiresReview(@PathVariable UUID id, @PathVariable String contextId) {
        return ResponseEntity.ok(taskService.toggleRequiresReview(contextId, id));
    }

    @PatchMapping("/{id}/category")
    public ResponseEntity<TaskResponseDto> updateCategory(
            @PathVariable UUID id,
            @RequestBody CategoryPatchDto dto,
            @PathVariable String contextId) {    // no @Valid, categoryId is optional
        return ResponseEntity.ok(taskService.updateCategory(contextId, id, dto.categoryId()));
    }


    @DeleteMapping("/{id}/assign")
    public ResponseEntity<TaskResponseDto> unassign(@PathVariable UUID id,
                                                    @PathVariable String contextId) {
        return ResponseEntity.ok(taskService.unassign(contextId, id));
    }
    @DeleteMapping("/{id}/tags/{tagId}")
    public ResponseEntity<TaskResponseDto> removeTag(
            @PathVariable UUID id,
            @PathVariable UUID tagId,
            @PathVariable String contextId) {
        return ResponseEntity.ok(taskService.removeTag(contextId, id, tagId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable UUID id,
                                           @PathVariable String contextId) {
        taskService.deleteTask(contextId, id);
        return ResponseEntity.noContent().build();
    }
}
