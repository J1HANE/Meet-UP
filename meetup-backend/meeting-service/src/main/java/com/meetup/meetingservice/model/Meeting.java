package com.meetup.meetingservice.model;

import java.time.LocalDateTime;
import java.util.List;

public class Meeting {
    private String id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private MeetingStatus status;
    private String streamCallType;
    private String streamCallId;
    private String streamChannelType;
    private String streamChannelId;
    private List<MeetingParticipant> participants;
    private List<TranscriptSegment> transcripts;
    private List<MeetingDecision> decisions;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    
    public MeetingStatus getStatus() { return status; }
    public void setStatus(MeetingStatus status) { this.status = status; }
    
    public String getStreamCallType() { return streamCallType; }
    public void setStreamCallType(String streamCallType) { this.streamCallType = streamCallType; }

    public String getStreamCallId() { return streamCallId; }
    public void setStreamCallId(String streamCallId) { this.streamCallId = streamCallId; }

    public String getStreamChannelType() { return streamChannelType; }
    public void setStreamChannelType(String streamChannelType) { this.streamChannelType = streamChannelType; }

    public String getStreamChannelId() { return streamChannelId; }
    public void setStreamChannelId(String streamChannelId) { this.streamChannelId = streamChannelId; }
    
    public List<MeetingParticipant> getParticipants() { return participants; }
    public void setParticipants(List<MeetingParticipant> participants) { this.participants = participants; }
    
    public List<TranscriptSegment> getTranscripts() { return transcripts; }
    public void setTranscripts(List<TranscriptSegment> transcripts) { this.transcripts = transcripts; }
    
    public List<MeetingDecision> getDecisions() { return decisions; }
    public void setDecisions(List<MeetingDecision> decisions) { this.decisions = decisions; }
}
