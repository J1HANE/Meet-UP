package com.meetup.aiservice.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * The unified context object sent to any /insights endpoint.
 * Combines data from all 4 services:
 *  - Task Management Service  → tasks
 *  - User Service             → participants
 *  - Meeting Service          → meeting
 *  - Tweening Service → groups
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
@Schema(description = "Unified context combining data from all four services")
public class MeetingContext {

    @Schema(description = "Meeting data from Meeting Service")
    private MeetingData meeting;

    @Schema(description = "List of tasks from Task Management Service")
    private List<Map<String, Object>> tasks;

    @Schema(description = "List of participants from User Service")
    private List<Map<String, Object>> participants;

    @Schema(description = "List of groups/teams from Tweening Service")
    private List<Map<String, Object>> groups;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    @Schema(description = "Meeting data structure")
    public static class MeetingData {

        @Schema(description = "Unique identifier for the meeting", example = "meeting-123")
        private String meetingId;

        @Schema(description = "Meeting title", example = "Sprint Planning")
        private String title;

        @Schema(description = "Meeting description", example = "Plan the next sprint deliverables")
        private String description;

        @Schema(description = "Meeting start time", example = "2024-01-15T10:00:00Z")
        private String startTime;

        @Schema(description = "Meeting end time", example = "2024-01-15T11:00:00Z")
        private String endTime;

        @Schema(description = "Meeting status", example = "SCHEDULED", allowableValues = {"SCHEDULED", "IN_PROGRESS", "COMPLETED"})
        private String status;

        @Schema(description = "Meeting organizer ID", example = "user-456")
        private String organizer;

        @Schema(description = "List of attendee IDs", example = "[\"user-456\", \"user-789\"]")
        private List<String> attendeeIds;

        @Schema(description = "Meeting agenda items")
        private List<Map<String, Object>> agenda;

        @Schema(description = "Action items from the meeting")
        private List<Map<String, Object>> actionItems;

        @Schema(description = "Meeting notes or transcript")
        private String notes;

        @Schema(description = "URL to meeting recording", example = "https://example.com/recordings/meeting-123")
        private String recordingUrl;
    }
}

