package com.meetup.taskservice.controller;


import com.meetup.taskservice.dto.*;
import com.meetup.taskservice.dto.patch.*;
import com.meetup.taskservice.dto.request.TaskCreateDto;
import com.meetup.taskservice.dto.request.TaskDependencyCreateDto;
import com.meetup.taskservice.dto.request.TaskDependencyUpdateDto;
import com.meetup.taskservice.dto.request.TaskUpdateDto;
import com.meetup.taskservice.dto.response.TaskBlockResponseDto;
import com.meetup.taskservice.dto.response.TaskDependencyResponseDto;
import com.meetup.taskservice.dto.response.TaskResponseDto;
import com.meetup.taskservice.service.TaskDependencyService;
import com.meetup.taskservice.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks/context/{contextId}/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task management — CRUD, patch operations, dependencies, and block history")
public class TaskController {

    private final TaskService taskService;
    private final TaskDependencyService dependencyService;

    // -------------------------------------------------------------------------
    // Queries
    // -------------------------------------------------------------------------

    @Operation(summary = "List all tasks", description = "Returns all tasks belonging to the given context.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tasks retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Context not found", content = @Content)
    })
    @GetMapping
    public ResponseEntity<List<TaskResponseDto>> getTasks(@PathVariable String contextId) {
        return ResponseEntity.ok(taskService.getTasks(contextId));
    }

    @GetMapping("/snapshot")
    public ResponseEntity<List<TaskSnapShot>> getSnapshot(@PathVariable String contextId) {
        return ResponseEntity.ok(taskService.getSnapshot(contextId));
    }

    @Operation(summary = "Get task by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Task found"),
            @ApiResponse(responseCode = "404", description = "Task not found", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponseDto> getTaskById(
            @PathVariable String contextId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(taskService.getTaskById(contextId, id));
    }

    @Operation(summary = "Get task detail", description = "Returns a detailed view of the task including tags, category, and dependency references.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Task detail retrieved"),
            @ApiResponse(responseCode = "404", description = "Task not found", content = @Content)
    })
    @GetMapping("/{id}/detail")
    public ResponseEntity<TaskDetailDto> getTaskDetail(
            @PathVariable String contextId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(taskService.getTaskDetail(contextId, id));
    }

    @Operation(summary = "Get task statistics", description = "Returns computed stats: progress, subtask completion rate, hours variance, block counts, and age.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Stats retrieved"),
            @ApiResponse(responseCode = "404", description = "Task not found", content = @Content)
    })
    @GetMapping("/{id}/stats")
    public ResponseEntity<TaskStatsDto> getTaskStats(
            @PathVariable String contextId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(taskService.getTaskStats(contextId, id));
    }

    @Operation(summary = "Get subtasks", description = "Returns a summary list of all direct subtasks.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Subtasks retrieved"),
            @ApiResponse(responseCode = "404", description = "Task not found", content = @Content)
    })
    @GetMapping("/{id}/subtasks")
    public ResponseEntity<List<TaskSummaryDto>> getSubTasks(
            @PathVariable String contextId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(taskService.getSubTasks(contextId, id));
    }

    @Operation(summary = "Get dependency summary", description = "Returns two lists: task IDs this task is blocked by, and task IDs this task is blocking.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Summary retrieved"),
            @ApiResponse(responseCode = "404", description = "Task not found", content = @Content)
    })
    @GetMapping("/{id}/dependencies/summary")
    public ResponseEntity<TaskDependencySummaryDto> getDependencySummary(
            @PathVariable String contextId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(taskService.getDependencySummary(contextId, id));
    }

    // -------------------------------------------------------------------------
    // Create / Update / Delete
    // -------------------------------------------------------------------------

    @Operation(summary = "Create a task", description = "Creates a new task in the context. Optionally attaches a category, tags, parent task, and dependencies.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Task created"),
            @ApiResponse(responseCode = "400", description = "Validation error", content = @Content),
            @ApiResponse(responseCode = "404", description = "Referenced category, tag, or task not found", content = @Content)
    })
    @PostMapping
    public ResponseEntity<TaskResponseDto> createTask(
            @PathVariable String contextId,
            @RequestBody @Valid TaskCreateDto taskCreateDto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(contextId, taskCreateDto));
    }

    @Operation(summary = "Update a task", description = "Full update of mutable task fields. Only fields present in the body are applied.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Task updated"),
            @ApiResponse(responseCode = "400", description = "Validation error", content = @Content),
            @ApiResponse(responseCode = "404", description = "Task not found", content = @Content)
    })
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponseDto> updateTask(
            @PathVariable String contextId,
            @PathVariable UUID id,
            @RequestBody @Valid TaskUpdateDto taskUpdateDto) {
        return ResponseEntity.ok(taskService.updateTask(contextId, id, taskUpdateDto));
    }

    @Operation(summary = "Delete a task", description = "Permanently deletes the task. Associated subtasks are orphaned or cascade-deleted depending on DB config.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Task deleted"),
            @ApiResponse(responseCode = "404", description = "Task not found", content = @Content)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable String contextId,
            @PathVariable UUID id) {
        taskService.deleteTask(contextId, id);
        return ResponseEntity.noContent().build();
    }

    // -------------------------------------------------------------------------
    // Tags
    // -------------------------------------------------------------------------

    @Operation(summary = "Add a tag to a task")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tag added"),
            @ApiResponse(responseCode = "404", description = "Task or tag not found", content = @Content)
    })
    @PostMapping("/{id}/tags/{tagId}")
    public ResponseEntity<TaskResponseDto> addTag(
            @PathVariable String contextId,
            @PathVariable UUID id,
            @PathVariable UUID tagId) {
        return ResponseEntity.ok(taskService.addTag(contextId, id, tagId));
    }

    @Operation(summary = "Replace all tags on a task", description = "Replaces the current tag set with exactly the provided tag IDs.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tags replaced"),
            @ApiResponse(responseCode = "404", description = "Task or one of the tags not found", content = @Content)
    })
    @PutMapping("/{id}/tags")
    public ResponseEntity<TaskResponseDto> replaceTags(
            @PathVariable String contextId,
            @PathVariable UUID id,
            @RequestBody @Valid TagsPatchDto dto) {
        return ResponseEntity.ok(taskService.replaceTags(contextId, id, dto.tagIds()));
    }

    @Operation(summary = "Remove a tag from a task")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tag removed"),
            @ApiResponse(responseCode = "404", description = "Task not found or tag not present on task", content = @Content)
    })
    @DeleteMapping("/{id}/tags/{tagId}")
    public ResponseEntity<TaskResponseDto> removeTag(
            @PathVariable String contextId,
            @PathVariable UUID id,
            @PathVariable UUID tagId) {
        return ResponseEntity.ok(taskService.removeTag(contextId, id, tagId));
    }

    // -------------------------------------------------------------------------
    // Patch Operations
    // -------------------------------------------------------------------------

    @Operation(summary = "Update task name")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Name updated"),
            @ApiResponse(responseCode = "400", description = "Name is blank or exceeds 255 characters", content = @Content),
            @ApiResponse(responseCode = "404", description = "Task not found", content = @Content)
    })
    @PatchMapping("/{id}/name")
    public ResponseEntity<TaskResponseDto> updateName(
            @PathVariable String contextId,
            @PathVariable UUID id,
            @RequestBody @Valid NamePatchDto dto) {
        return ResponseEntity.ok(taskService.updateTaskName(contextId, id, dto.name()));
    }

    @Operation(summary = "Update task status", description = "Transitions the task to a new status. Applying IN_PROGRESS is rejected if the task has unresolved blocking dependencies. Status timestamps (startedAt, completedAt, etc.) are set automatically.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Status updated"),
            @ApiResponse(responseCode = "400", description = "Task has unresolved blocking dependencies", content = @Content),
            @ApiResponse(responseCode = "404", description = "Task not found", content = @Content)
    })
    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponseDto> updateStatus(
            @PathVariable String contextId,
            @PathVariable UUID id,
            @RequestBody @Valid StatusPatchDto dto) {
        return ResponseEntity.ok(taskService.updateStatus(contextId, id, dto.status()));
    }

    @Operation(summary = "Update task priority")
    @ApiResponse(responseCode = "200", description = "Priority updated")
    @PatchMapping("/{id}/priority")
    public ResponseEntity<TaskResponseDto> updatePriority(
            @PathVariable String contextId,
            @PathVariable UUID id,
            @RequestBody @Valid PriorityPatchDto dto) {
        return ResponseEntity.ok(taskService.updatePriority(contextId, id, dto.priority()));
    }

    @Operation(summary = "Update task visibility")
    @ApiResponse(responseCode = "200", description = "Visibility updated")
    @PatchMapping("/{id}/visibility")
    public ResponseEntity<TaskResponseDto> updateVisibility(
            @PathVariable String contextId,
            @PathVariable UUID id,
            @RequestBody @Valid VisibilityPatchDto dto) {
        return ResponseEntity.ok(taskService.updateVisibility(contextId, id, dto.visibility()));
    }

    @Operation(summary = "Update story points")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Points updated"),
            @ApiResponse(responseCode = "400", description = "Points cannot be negative", content = @Content)
    })
    @PatchMapping("/{id}/points")
    public ResponseEntity<TaskResponseDto> updatePoints(
            @PathVariable String contextId,
            @PathVariable UUID id,
            @RequestBody @Valid PointsPatchDto dto) {
        return ResponseEntity.ok(taskService.updatePoints(contextId, id, dto.points()));
    }

    @Operation(summary = "Update progress percentage", description = "Accepts a value between 0 and 100 inclusive.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Progress updated"),
            @ApiResponse(responseCode = "400", description = "Value out of range", content = @Content)
    })
    @PatchMapping("/{id}/progress")
    public ResponseEntity<TaskResponseDto> updateProgress(
            @PathVariable String contextId,
            @PathVariable UUID id,
            @RequestBody @Valid ProgressPatchDto dto) {
        return ResponseEntity.ok(taskService.updateProgress(contextId, id, dto.progressPercent()));
    }

    @Operation(summary = "Update estimated and actual hours")
    @ApiResponse(responseCode = "200", description = "Hours updated")
    @PatchMapping("/{id}/hours")
    public ResponseEntity<TaskResponseDto> updateHours(
            @PathVariable String contextId,
            @PathVariable UUID id,
            @RequestBody @Valid TaskHoursDto dto) {
        return ResponseEntity.ok(taskService.updateHours(contextId, id, dto));
    }

    @Operation(summary = "Update task dates", description = "Updates start, end, baselineStart, and baselineEnd. End date must not precede start date.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dates updated"),
            @ApiResponse(responseCode = "400", description = "End date is before start date", content = @Content)
    })
    @PatchMapping("/{id}/dates")
    public ResponseEntity<TaskResponseDto> updateDates(
            @PathVariable String contextId,
            @PathVariable UUID id,
            @RequestBody @Valid TaskDatesDto dto) {
        return ResponseEntity.ok(taskService.updateDates(contextId, id, dto));
    }

    @Operation(summary = "Assign task", description = "Assigns the task to a person or team. Sets assignedAt automatically.")
    @ApiResponse(responseCode = "200", description = "Task assigned")
    @PatchMapping("/{id}/assign")
    public ResponseEntity<TaskResponseDto> assign(
            @PathVariable String contextId,
            @PathVariable UUID id,
            @RequestBody @Valid AssignPatchDto dto) {
        return ResponseEntity.ok(taskService.assign(contextId, id, dto.assignedTo(), dto.assignedToType()));
    }

    @Operation(summary = "Unassign task", description = "Clears the assignee and assignedAt timestamp.")
    @ApiResponse(responseCode = "200", description = "Task unassigned")
    @DeleteMapping("/{id}/assign")
    public ResponseEntity<TaskResponseDto> unassign(
            @PathVariable String contextId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(taskService.unassign(contextId, id));
    }

    @Operation(summary = "Update reviewer")
    @ApiResponse(responseCode = "200", description = "Reviewer updated")
    @PatchMapping("/{id}/reviewer")
    public ResponseEntity<TaskResponseDto> updateReviewer(
            @PathVariable String contextId,
            @PathVariable UUID id,
            @RequestBody @Valid ReviewerPatchDto dto) {
        return ResponseEntity.ok(taskService.updateReviewer(contextId, id, dto.reviewedBy()));
    }

    @Operation(summary = "Set milestone flag")
    @ApiResponse(responseCode = "200", description = "Milestone flag set")
    @PatchMapping("/{id}/milestone")
    public ResponseEntity<TaskResponseDto> setMilestone(
            @PathVariable String contextId,
            @PathVariable UUID id,
            @RequestBody @Valid MilestonePatchDto dto) {
        return ResponseEntity.ok(taskService.setMilestone(contextId, id, dto.isMilestone()));
    }

    @Operation(summary = "Toggle milestone flag")
    @ApiResponse(responseCode = "200", description = "Milestone flag toggled")
    @PatchMapping("/{id}/milestone/toggle")
    public ResponseEntity<TaskResponseDto> toggleMilestone(
            @PathVariable String contextId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(taskService.toggleMilestone(contextId, id));
    }

    @Operation(summary = "Update recurrence", description = "Pass an interval to enable recurrence, or null/omit to disable it.")
    @ApiResponse(responseCode = "200", description = "Recurrence updated")
    @PatchMapping("/{id}/recurrence")
    public ResponseEntity<TaskResponseDto> updateRecurrence(
            @PathVariable String contextId,
            @PathVariable UUID id,
            @RequestBody @Valid RecurrencePatchDto dto) {
        return ResponseEntity.ok(taskService.updateRecurrence(contextId, id, dto.interval()));
    }

    @Operation(summary = "Toggle requires-review flag")
    @ApiResponse(responseCode = "200", description = "Flag toggled")
    @PatchMapping("/{id}/requires-review/toggle")
    public ResponseEntity<TaskResponseDto> toggleRequiresReview(
            @PathVariable String contextId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(taskService.toggleRequiresReview(contextId, id));
    }

    @Operation(summary = "Update category", description = "Pass null as categoryId to remove the category from the task.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Category updated"),
            @ApiResponse(responseCode = "404", description = "Category not found", content = @Content)
    })
    @PatchMapping("/{id}/category")
    public ResponseEntity<TaskResponseDto> updateCategory(
            @PathVariable String contextId,
            @PathVariable UUID id,
            @RequestBody CategoryPatchDto dto) {
        return ResponseEntity.ok(taskService.updateCategory(contextId, id, dto.categoryId()));
    }

    // -------------------------------------------------------------------------
    // Dependencies
    // -------------------------------------------------------------------------

    @Operation(summary = "List dependencies", description = "Returns all declared dependencies for this task — every upstream task it depends on.")
    @ApiResponse(responseCode = "200", description = "Dependencies retrieved")
    @GetMapping("/{id}/dependencies")
    public ResponseEntity<List<TaskDependencyResponseDto>> getDependencies(
            @PathVariable String contextId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(dependencyService.getDependencies(contextId, id));
    }

    @Operation(
            summary = "List active blocking dependencies",
            description = "Returns only the dependencies that are currently blocking this task from progressing, computed from the status of each upstream task and the dependency type. Empty list means the task is not blocked."
    )
    @ApiResponse(responseCode = "200", description = "Blocking dependencies retrieved")
    @GetMapping("/{id}/dependencies/blocking")
    public ResponseEntity<List<BlockingDependencyDto>> getBlockingDependencies(
            @PathVariable String contextId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(dependencyService.getBlockingDependencies(contextId, id));
    }

    @Operation(
            summary = "Get block history",
            description = "Returns the historical log of every time this task was blocked and subsequently unblocked. Records are written automatically when blocking dependencies are created or resolved. unblockedAt is null on any record that is still open."
    )
    @ApiResponse(responseCode = "200", description = "Block history retrieved")
    @GetMapping("/{id}/dependencies/blocking/history")
    public ResponseEntity<List<TaskBlockResponseDto>> getBlockingHistory(
            @PathVariable String contextId,
            @PathVariable UUID id) {
        return ResponseEntity.ok(dependencyService.getBlockHistory(contextId, id));
    }

    @Operation(
            summary = "Add a dependency",
            description = "Declares that this task depends on another task. If the upstream task already satisfies the blocking condition for the given dependency type, a block history record is opened immediately."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Dependency created"),
            @ApiResponse(responseCode = "400", description = "Validation error", content = @Content),
            @ApiResponse(responseCode = "404", description = "Task or upstream task not found", content = @Content),
            @ApiResponse(responseCode = "409", description = "Dependency already exists between these tasks", content = @Content)
    })
    @PostMapping("/{id}/dependencies")
    public ResponseEntity<TaskDependencyResponseDto> createDependency(
            @PathVariable String contextId,
            @PathVariable UUID id,
            @RequestBody @Valid TaskDependencyCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(dependencyService.createDependency(contextId, id, dto));
    }

    @Operation(summary = "Update a dependency", description = "Updates the dependency type or lag days between the two tasks.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Dependency updated"),
            @ApiResponse(responseCode = "404", description = "Dependency not found", content = @Content)
    })
    @PutMapping("/{id}/dependencies/{dependencyId}")
    public ResponseEntity<TaskDependencyResponseDto> updateDependency(
            @PathVariable String contextId,
            @PathVariable UUID id,
            @PathVariable UUID dependencyId,
            @RequestBody @Valid TaskDependencyUpdateDto dto) {
        return ResponseEntity.ok(dependencyService.updateDependency(contextId, id, dependencyId, dto));
    }

    @Operation(
            summary = "Remove a dependency",
            description = "Deletes the dependency. If it was actively blocking the task, the corresponding open block history record is closed automatically."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Dependency deleted"),
            @ApiResponse(responseCode = "404", description = "Dependency not found", content = @Content)
    })
    @DeleteMapping("/{id}/dependencies/{dependencyId}")
    public ResponseEntity<Void> deleteDependency(
            @PathVariable String contextId,
            @PathVariable UUID id,
            @PathVariable UUID dependencyId) {
        dependencyService.deleteDependency(contextId, id, dependencyId);
        return ResponseEntity.noContent().build();
    }
}
