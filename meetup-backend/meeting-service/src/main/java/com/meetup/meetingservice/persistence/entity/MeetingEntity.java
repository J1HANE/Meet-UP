package com.meetup.meetingservice.persistence.entity;

import com.meetup.meetingservice.model.MeetingStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "meetings")
public class MeetingEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(name = "tween_id", nullable = false)
    private UUID tweenId;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "scheduled_at", nullable = false)
    private Instant scheduledAt;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MeetingStatus status;

    @Column(name = "max_participants")
    private Integer maxParticipants;

    @Column(name = "stream_call_id")
    private String streamCallId;

    @Column(name = "stream_call_type")
    private String streamCallType;

    @Column(name = "stream_call_created", nullable = false)
    private boolean streamCallCreated;

    @Column(name = "stream_channel_id")
    private String streamChannelId;

    @Column(name = "stream_channel_type")
    private String streamChannelType;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("joinedAt ASC")
    private List<MeetingParticipantEntity> participants = new ArrayList<>();

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("sentAt ASC")
    private List<MeetingChatMessageEntity> chatMessages = new ArrayList<>();

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("timestamp ASC")
    private List<TranscriptSegmentEntity> transcriptSegments = new ArrayList<>();

    @OneToMany(mappedBy = "meeting", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("createdAt ASC")
    private List<MeetingDecisionEntity> decisions = new ArrayList<>();

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

    public List<MeetingParticipantEntity> getParticipants() {
        return participants;
    }

    public void setParticipants(List<MeetingParticipantEntity> participants) {
        this.participants = participants;
    }

    public List<MeetingChatMessageEntity> getChatMessages() {
        return chatMessages;
    }

    public void setChatMessages(List<MeetingChatMessageEntity> chatMessages) {
        this.chatMessages = chatMessages;
    }

    public List<TranscriptSegmentEntity> getTranscriptSegments() {
        return transcriptSegments;
    }

    public void setTranscriptSegments(List<TranscriptSegmentEntity> transcriptSegments) {
        this.transcriptSegments = transcriptSegments;
    }

    public List<MeetingDecisionEntity> getDecisions() {
        return decisions;
    }

    public void setDecisions(List<MeetingDecisionEntity> decisions) {
        this.decisions = decisions;
    }
}
