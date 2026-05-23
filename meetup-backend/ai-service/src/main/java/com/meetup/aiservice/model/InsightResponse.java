package com.meetup.aiservice.model;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

/**
 * Every AI endpoint returns this structure:
 *  - summary     → plain English narrative (from AI)
 *  - insights    → structured list of findings (from AI as JSON)
 *  - model       → which AI model was used
 *  - insightType → what kind of analysis was done
 */
@Data
@Builder
@Schema(description = "Standard response structure for all AI insight endpoints")
public class InsightResponse {

    @Schema(description = "Type of analysis performed", example = "RISK_RADAR", allowableValues = {"TASKS", "RELATIONSHIPS", "MEETING_EFFECTIVENESS", "FULL", "RISK_RADAR", "ACTION_ITEMS"})
    private String insightType;

    @Schema(description = "Plain English narrative summary of the insights", example = "The team has 3 overdue tasks and potential burnout risk with John due to 120% workload")
    private String summary;

    @Schema(description = "Structured list of findings from AI analysis")
    private List<Insight> insights;

    @Schema(description = "AI model used for generation", example = "gemini", allowableValues = {"gemini", "ollama"})
    private String model;

    @Schema(description = "Timestamp when the insights were generated", example = "2024-01-15T10:30:00Z")
    private String generatedAt;

    @Data
    @Builder
    @Schema(description = "Individual insight finding")
    public static class Insight {

        @Schema(description = "Category of the insight", example = "RISK", allowableValues = {"RISK", "RELATIONSHIP", "WORKLOAD", "BOTTLENECK", "OPPORTUNITY"})
        private String category;

        @Schema(description = "Severity level", example = "HIGH", allowableValues = {"HIGH", "MEDIUM", "LOW", "INFO"})
        private String severity;

        @Schema(description = "Brief title of the insight", example = "Overdue payment service task blocking frontend team")
        private String title;

        @Schema(description = "Detailed explanation of the finding", example = "The payment integration task is 5 days overdue and is blocking 3 dependent tasks")
        private String detail;

        @Schema(description = "IDs of users, tasks, or other entities affected", example = "[\"task-123\", \"user-456\"]")
        private List<String> affectedEntities;

        @Schema(description = "Suggested action to address the finding", example = "Reassign the payment task or bring in additional backend resources")
        private String recommendation;
    }
}
