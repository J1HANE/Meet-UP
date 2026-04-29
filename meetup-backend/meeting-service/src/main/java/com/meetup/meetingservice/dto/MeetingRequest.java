package com.meetup.meetingservice.dto;

import java.time.LocalDateTime;

public class MeetingRequest {
    private String title;
    private String description;
    private LocalDateTime startTime;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
}
