package com.meetup.meetingservice.persistence;

import com.meetup.meetingservice.model.Meeting;
import com.meetup.meetingservice.model.MeetingChatMessage;
import com.meetup.meetingservice.model.MeetingDecision;
import com.meetup.meetingservice.model.MeetingParticipant;
import com.meetup.meetingservice.model.TranscriptSegment;
import com.meetup.meetingservice.persistence.entity.MeetingChatMessageEntity;
import com.meetup.meetingservice.persistence.entity.MeetingDecisionEntity;
import com.meetup.meetingservice.persistence.entity.MeetingEntity;
import com.meetup.meetingservice.persistence.entity.MeetingParticipantEntity;
import com.meetup.meetingservice.persistence.entity.TranscriptSegmentEntity;
import com.meetup.meetingservice.persistence.repository.MeetingJpaRepository;
import com.meetup.meetingservice.repository.MeetingRepository;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class PersistenceMeetingRepositoryAdapter implements MeetingRepository {

    private final MeetingJpaRepository meetingJpaRepository;

    public PersistenceMeetingRepositoryAdapter(MeetingJpaRepository meetingJpaRepository) {
        this.meetingJpaRepository = meetingJpaRepository;
    }

    @Override
    public Meeting save(Meeting meeting) {
        MeetingEntity saved = meetingJpaRepository.save(toEntity(meeting));
        return toDomain(saved);
    }

    @Override
    public List<Meeting> findAll() {
        return meetingJpaRepository.findAllByOrderByCreatedAtAsc().stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public Optional<Meeting> findById(UUID meetingId) {
        return meetingJpaRepository.findById(meetingId)
                .map(this::toDomain);
    }

    private MeetingEntity toEntity(Meeting meeting) {
        MeetingEntity entity = new MeetingEntity();
        entity.setId(meeting.getId());
        entity.setTitle(meeting.getTitle());
        entity.setTweenId(meeting.getTweenId());
        entity.setCreatedBy(meeting.getCreatedBy());
        entity.setScheduledAt(meeting.getScheduledAt());
        entity.setStartedAt(meeting.getStartedAt());
        entity.setEndedAt(meeting.getEndedAt());
        entity.setStatus(meeting.getStatus());
        entity.setMaxParticipants(meeting.getMaxParticipants());
        entity.setStreamCallId(meeting.getStreamCallId());
        entity.setStreamCallType(meeting.getStreamCallType());
        entity.setStreamCallCreated(meeting.isStreamCallCreated());
        entity.setStreamChannelId(meeting.getStreamChannelId());
        entity.setStreamChannelType(meeting.getStreamChannelType());
        entity.setCreatedAt(meeting.getCreatedAt());
        entity.setUpdatedAt(meeting.getUpdatedAt());
        entity.setNotes(meeting.getNotes());

        entity.setParticipants(new ArrayList<>());
        for (MeetingParticipant participant : meeting.getParticipants()) {
            MeetingParticipantEntity participantEntity = new MeetingParticipantEntity();
            participantEntity.setId(participant.getId());
            participantEntity.setMeeting(entity);
            participantEntity.setUserId(participant.getUserId());
            participantEntity.setDisplayName(participant.getDisplayName());
            participantEntity.setRole(participant.getRole());
            participantEntity.setJoinedAt(participant.getJoinedAt());
            entity.getParticipants().add(participantEntity);
        }

        entity.setChatMessages(new ArrayList<>());
        for (MeetingChatMessage message : meeting.getChatMessages()) {
            MeetingChatMessageEntity messageEntity = new MeetingChatMessageEntity();
            messageEntity.setId(message.getId());
            messageEntity.setMeeting(entity);
            messageEntity.setUserId(message.getUserId());
            messageEntity.setDisplayName(message.getDisplayName());
            messageEntity.setMessage(message.getMessage());
            messageEntity.setSentAt(message.getSentAt());
            entity.getChatMessages().add(messageEntity);
        }

        entity.setTranscriptSegments(new ArrayList<>());
        for (TranscriptSegment segment : meeting.getTranscriptSegments()) {
            TranscriptSegmentEntity segmentEntity = new TranscriptSegmentEntity();
            segmentEntity.setId(segment.getId());
            segmentEntity.setMeeting(entity);
            segmentEntity.setSpeakerId(segment.getSpeakerId());
            segmentEntity.setSpeakerName(segment.getSpeakerName());
            segmentEntity.setText(segment.getText());
            segmentEntity.setTimestamp(segment.getTimestamp());
            entity.getTranscriptSegments().add(segmentEntity);
        }

        entity.setDecisions(new ArrayList<>());
        for (MeetingDecision decision : meeting.getDecisions()) {
            MeetingDecisionEntity decisionEntity = new MeetingDecisionEntity();
            decisionEntity.setId(decision.getId());
            decisionEntity.setMeeting(entity);
            decisionEntity.setContent(decision.getContent());
            decisionEntity.setCreatedAt(decision.getCreatedAt());
            entity.getDecisions().add(decisionEntity);
        }

        return entity;
    }

    private Meeting toDomain(MeetingEntity entity) {
        Meeting meeting = new Meeting();
        meeting.setId(entity.getId());
        meeting.setTitle(entity.getTitle());
        meeting.setTweenId(entity.getTweenId());
        meeting.setCreatedBy(entity.getCreatedBy());
        meeting.setScheduledAt(entity.getScheduledAt());
        meeting.setStartedAt(entity.getStartedAt());
        meeting.setEndedAt(entity.getEndedAt());
        meeting.setStatus(entity.getStatus());
        meeting.setMaxParticipants(entity.getMaxParticipants());
        meeting.setStreamCallId(entity.getStreamCallId());
        meeting.setStreamCallType(entity.getStreamCallType());
        meeting.setStreamCallCreated(entity.isStreamCallCreated());
        meeting.setStreamChannelId(entity.getStreamChannelId());
        meeting.setStreamChannelType(entity.getStreamChannelType());
        meeting.setCreatedAt(entity.getCreatedAt());
        meeting.setUpdatedAt(entity.getUpdatedAt());
        meeting.setNotes(entity.getNotes());

        entity.getParticipants().forEach(participantEntity -> {
            MeetingParticipant participant = new MeetingParticipant();
            participant.setId(participantEntity.getId());
            participant.setMeetingId(entity.getId());
            participant.setUserId(participantEntity.getUserId());
            participant.setDisplayName(participantEntity.getDisplayName());
            participant.setRole(participantEntity.getRole());
            participant.setJoinedAt(participantEntity.getJoinedAt());
            meeting.getParticipants().add(participant);
        });

        entity.getChatMessages().forEach(messageEntity -> {
            MeetingChatMessage message = new MeetingChatMessage();
            message.setId(messageEntity.getId());
            message.setMeetingId(entity.getId());
            message.setUserId(messageEntity.getUserId());
            message.setDisplayName(messageEntity.getDisplayName());
            message.setMessage(messageEntity.getMessage());
            message.setSentAt(messageEntity.getSentAt());
            meeting.getChatMessages().add(message);
        });

        entity.getTranscriptSegments().forEach(segmentEntity -> {
            TranscriptSegment segment = new TranscriptSegment();
            segment.setId(segmentEntity.getId());
            segment.setMeetingId(entity.getId());
            segment.setSpeakerId(segmentEntity.getSpeakerId());
            segment.setSpeakerName(segmentEntity.getSpeakerName());
            segment.setText(segmentEntity.getText());
            segment.setTimestamp(segmentEntity.getTimestamp());
            meeting.getTranscriptSegments().add(segment);
        });

        entity.getDecisions().forEach(decisionEntity -> {
            MeetingDecision decision = new MeetingDecision();
            decision.setId(decisionEntity.getId());
            decision.setMeetingId(entity.getId());
            decision.setContent(decisionEntity.getContent());
            decision.setCreatedAt(decisionEntity.getCreatedAt());
            meeting.getDecisions().add(decision);
        });

        return meeting;
    }
}
