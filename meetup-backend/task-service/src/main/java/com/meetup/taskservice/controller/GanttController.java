package com.meetup.taskservice.controller;

import com.meetup.taskservice.dto.gantt.GanttResponseDto;
import com.meetup.taskservice.service.GanttService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/context/{contextId}/tasks/gantt")
@RequiredArgsConstructor
@Tag(name = "Gantt Chart", description = "Endpoints for Gantt chart data")
public class GanttController {

    private final GanttService ganttService;

    @Operation(summary = "Get Gantt chart data", description = "Returns all Gantt chart data for the given context.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Gantt data retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Context not found", content = @Content)
    })
    @GetMapping
    public ResponseEntity<GanttResponseDto> getGantt(@PathVariable String contextId) {
        return ResponseEntity.ok(ganttService.getGanttData(contextId));
    }

    @Operation(summary = "Get Gantt chart data by category", description = "Returns Gantt chart data filtered by category for the given context.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Gantt data retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Context or category not found", content = @Content)
    })
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<GanttResponseDto> getGanttByCategory(@PathVariable UUID categoryId, @PathVariable String contextId) {
        return ResponseEntity.ok(ganttService.getGanttDataByCategory(categoryId, contextId));
    }
}
