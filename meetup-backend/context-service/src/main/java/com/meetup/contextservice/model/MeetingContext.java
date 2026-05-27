package com.meetup.contextservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.meetup.contextservice.dto.TaskSnapshot;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "meeting_contexts")
public class MeetingContext implements Serializable {

    @Id
    private String id; // MongoDB internal ID

    private UUID meetingId;
    
    @Builder.Default
    private List<UUID> participantIds = new ArrayList<>();
    
    @Builder.Default
    private List<UUID> tweenGroupIds = new ArrayList<>();
    
    @Builder.Default
    private List<TranscriptChunk> transcript = new ArrayList<>();
    
    @Builder.Default
    private List<Decision> decisions = new ArrayList<>();
    
    @Builder.Default
    private List<UUID> tasksRef = new ArrayList<>();
    
    @Builder.Default
    private List<String> topics = new ArrayList<>();
    
    private String summary;
    
    @Builder.Default
    private MeetingStatus status = MeetingStatus.LIVE;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @JsonIgnore
    @Builder.Default
    private List<Map<String, Object>> tasks = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TranscriptChunk implements Serializable {
        private String speakerId;
        private String text;
        private LocalDateTime timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Decision implements Serializable {
        private String text;
        private String attributedSpeakerId;
        private UUID meetingId;
        private LocalDateTime timestamp;
    }
}
