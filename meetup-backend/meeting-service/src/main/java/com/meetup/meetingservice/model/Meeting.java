package com.meetup.meetingservice.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class Meeting {

    private UUID id;
    private String title;
    private UUID tweenId;
    private UUID createdBy;
    private Instant scheduledAt;
    private Instant startedAt;
    private Instant endedAt;
    private MeetingStatus status;
    private Integer maxParticipants;
    private String streamCallId;
    private String streamCallType;
    private boolean streamCallCreated;
    private String streamChannelId;
    private String streamChannelType;
    private Instant createdAt;
    private Instant updatedAt;
    private final List<MeetingParticipant> participants = new ArrayList<>();
    private final List<MeetingChatMessage> chatMessages = new ArrayList<>();
    private final List<TranscriptSegment> transcriptSegments = new ArrayList<>();
    private final List<MeetingDecision> decisions = new ArrayList<>();
    private String notes;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public UUID getTweenId() {
        return tweenId;
    }

    public void setTweenId(UUID tweenId) {
        this.tweenId = tweenId;
    }

    public UUID getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UUID createdBy) {
        this.createdBy = createdBy;
    }

    public Instant getScheduledAt() {
        return scheduledAt;
    }

    public void setScheduledAt(Instant scheduledAt) {
        this.scheduledAt = scheduledAt;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public Instant getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(Instant endedAt) {
        this.endedAt = endedAt;
    }

    public MeetingStatus getStatus() {
        return status;
    }

    public void setStatus(MeetingStatus status) {
        this.status = status;
    }

    public Integer getMaxParticipants() {
        return maxParticipants;
    }

    public void setMaxParticipants(Integer maxParticipants) {
        this.maxParticipants = maxParticipants;
    }

    public String getStreamCallId() {
        return streamCallId;
    }

    public void setStreamCallId(String streamCallId) {
        this.streamCallId = streamCallId;
    }

    public String getStreamCallType() {
        return streamCallType;
    }

    public void setStreamCallType(String streamCallType) {
        this.streamCallType = streamCallType;
    }

    public boolean isStreamCallCreated() {
        return streamCallCreated;
    }

    public void setStreamCallCreated(boolean streamCallCreated) {
        this.streamCallCreated = streamCallCreated;
    }

    public String getStreamChannelId() {
        return streamChannelId;
    }

    public void setStreamChannelId(String streamChannelId) {
        this.streamChannelId = streamChannelId;
    }

    public String getStreamChannelType() {
        return streamChannelType;
    }

    public void setStreamChannelType(String streamChannelType) {
        this.streamChannelType = streamChannelType;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<MeetingParticipant> getParticipants() {
        return participants;
    }

    public List<MeetingChatMessage> getChatMessages() {
        return chatMessages;
    }

    public List<TranscriptSegment> getTranscriptSegments() {
        return transcriptSegments;
    }

    public List<MeetingDecision> getDecisions() {
        return decisions;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
