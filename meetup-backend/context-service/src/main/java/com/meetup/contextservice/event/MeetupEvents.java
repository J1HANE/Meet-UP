package com.meetup.contextservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class MeetupEvents {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MeetingStarted {
        private UUID meetingId;
        private List<UUID> participantIds;
        private List<UUID> tweenGroupIds;
        private LocalDateTime timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TranscriptChunk {
        private UUID meetingId;
        private String speakerId;
        private String text;
        private LocalDateTime timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskCreated {
        private UUID taskId;
        private UUID meetingId;
        private String title;
        private String description;
        private List<UUID> assigneeIds;
        private LocalDateTime timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MeetingEnded {
        private UUID meetingId;
        private LocalDateTime timestamp;
    }
}
