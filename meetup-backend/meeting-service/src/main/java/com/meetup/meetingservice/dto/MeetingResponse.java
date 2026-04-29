package com.meetup.meetingservice.dto;

import com.meetup.meetingservice.model.MeetingStatus;
import java.time.LocalDateTime;

public class MeetingResponse {
    private String id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private MeetingStatus status;
    private String meetingLink;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public MeetingStatus getStatus() { return status; }
    public void setStatus(MeetingStatus status) { this.status = status; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
}
