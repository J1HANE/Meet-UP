package com.meetup.aiservice.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;

/**
 * The structured output produced by the AI pipeline.
 * Stored in Redis (Cache B) and returned to callers.
 * Also posted to Context Service and Task Service.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SummaryResult implements Serializable {

    private String meetingId;
    private Instant generatedAt;

    /** Narrative paragraph summarising the meeting */
    private String narrative;

    /** Decisions the LLM identified from the transcript */
    private List<Decision> decisions;

    /** Draft tasks extracted by the LLM — require user confirmation */
    private List<DraftTask> suggestedTasks;

    /** Per-group observations */
    private List<GroupInsight> groupInsights;

    /** Open questions that were raised but not resolved */
    private List<String> openQuestions;

    @Data
    public static class Decision {
        private String text;
        private String attributedSpeaker;
        private String confidence;  // high | medium | low
    }

    @Data
    public static class DraftTask {
        private String title;
        private String description;
        private String suggestedAssignee;
        private String priority;  // high | medium | low
        /** Always "draft" — Task Service requires user confirmation */
        private String status = "draft";
    }

    @Data
    public static class GroupInsight {
        private String groupId;
        private String groupName;
        private String observation;
    }
}

