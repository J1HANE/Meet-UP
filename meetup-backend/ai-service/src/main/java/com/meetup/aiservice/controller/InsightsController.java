package com.meetup.aiservice.controller;


import com.meetup.aiservice.model.InsightResponse;
import com.meetup.aiservice.model.MeetingContext;
import com.meetup.aiservice.service.MeetingIntelligenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * All AI insight endpoints.
 *
 * Every POST endpoint accepts the same MeetingContext body (data from all 4 services).
 * The optional "model" query param lets callers override auto-routing:
 *   ?model=ollama  → force local model
 *   ?model=gemini  → force cloud model
 *   (omit)         → auto-route based on complexity
 */
@RestController
@RequestMapping("/ai/insights")
@RequiredArgsConstructor
@Tag(name = "AI Insights", description = "Endpoints for AI-powered meeting and task intelligence")
public class InsightsController {

    private final MeetingIntelligenceService intelligenceService;

    @Operation(summary = "Analyse tasks", description = "Analyses overdue items, blockers, workload issues, and priority risks.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Analysis completed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content)
    })
    @PostMapping("/tasks")
    public ResponseEntity<InsightResponse> analyseTasks(
            @RequestBody List<Map<String, Object>> tasks,
            @RequestParam(required = false) String model) {

        return ResponseEntity.ok(intelligenceService.analyseTasks(tasks, model));
    }

    @Operation(summary = "Analyse relationships", description = "Analyses team silos, bottlenecks, collaboration patterns, and disengaged members.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Analysis completed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content)
    })
    @PostMapping("/relationships")
    public ResponseEntity<InsightResponse> analyseRelationships(
            @RequestBody MeetingContext context,
            @RequestParam(required = false) String model) {

        return ResponseEntity.ok(intelligenceService.analyseRelationships(context, model));
    }

    @Operation(summary = "Evaluate meeting effectiveness", description = "Evaluates agenda gaps, missing owners, wrong attendees, and action item quality.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Evaluation completed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content)
    })
    @PostMapping("/meeting-effectiveness")
    public ResponseEntity<InsightResponse> meetingEffectiveness(
            @RequestBody MeetingContext context,
            @RequestParam(required = false) String model) {

        return ResponseEntity.ok(intelligenceService.analyseMeetingEffectiveness(context, model));
    }

    @Operation(summary = "Full intelligence report", description = "Comprehensive report combining project health, team dynamics, risks, priorities, and recommendations.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Report generated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content)
    })
    @PostMapping("/full")
    public ResponseEntity<InsightResponse> fullIntelligence(
            @RequestBody MeetingContext context,
            @RequestParam(required = false) String model) {

        return ResponseEntity.ok(intelligenceService.fullIntelligence(context, model));
    }

    @Operation(summary = "Risk radar", description = "Focuses on dependency chains, single points of failure, and overdue milestones with mitigation strategies.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Risk analysis completed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content)
    })
    @PostMapping("/risk-radar")
    public ResponseEntity<InsightResponse> riskRadar(
            @RequestBody MeetingContext context,
            @RequestParam(required = false) String model) {

        return ResponseEntity.ok(intelligenceService.riskRadar(context, model));
    }

    @Operation(summary = "Generate action items", description = "Generates structured meeting action items with owners and deadlines.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Action items generated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content)
    })
    @PostMapping("/action-items")
    public ResponseEntity<InsightResponse> actionItems(
            @RequestBody MeetingContext context,
            @RequestParam(required = false) String model) {

        return ResponseEntity.ok(intelligenceService.generateActionItems(context, model));
    }

    @Operation(summary = "Ask questions", description = "Ask natural language questions about the meeting, tasks, or team.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Answer generated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input or missing question parameter", content = @Content)
    })
    @PostMapping("/ask")
    public ResponseEntity<String> ask(
            @RequestBody MeetingContext context,
            @RequestParam String question,
            @RequestParam(required = false) String model) {

        return ResponseEntity.ok(intelligenceService.askQuestion(context, question, model));
    }

    @Operation(summary = "Health check", description = "Checks if the service is up and shows model status.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Service is healthy")
    })
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Meeting Intelligence System",
                "endpoints", List.of(
                        "POST /api/v1/insights/tasks",
                        "POST /api/v1/insights/relationships",
                        "POST /api/v1/insights/meeting-effectiveness",
                        "POST /api/v1/insights/full",
                        "POST /api/v1/insights/risk-radar",
                        "POST /api/v1/insights/action-items",
                        "POST /api/v1/insights/ask?question=your+question"
                )
        ));
    }
}

