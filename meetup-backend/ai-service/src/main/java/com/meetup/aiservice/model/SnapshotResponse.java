package com.meetup.aiservice.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SnapshotResponse {

    private String meetingId;
    private String meetingTitle;

    /** "live" or "complete" — drives cache TTL strategy */
    private String meetingStatus;

    private List<Participant> participants;
    private List<String> transcriptChunks;
    private List<Task> tasks;
    private List<Group> groups;
    private List<String> topicTags;
    private List<String> existingDecisions;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Participant {
        private String id;
        private String name;
        private String role;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Task {
        private String id;
        private String title;
        private String status;  // backlog, in_progress, blocked, review, done
        private String assigneeId;
        private String assigneeName;
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Group {
        private String id;
        private String name;
        private String state;  // forming, active, evolving, dissolved
        private String taskId;
        private List<String> memberNames;
    }

    public boolean isMeetingComplete() {
        return "complete".equalsIgnoreCase(meetingStatus);
    }
}
