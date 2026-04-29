package com.meetup.meetingservice.model;

import java.time.LocalDateTime;

public class TranscriptSegment {
    private String id;
    private String speakerId;
    private String text;
    private LocalDateTime timestamp;
    
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getSpeakerId() { return speakerId; }
    public void setSpeakerId(String speakerId) { this.speakerId = speakerId; }
    
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
