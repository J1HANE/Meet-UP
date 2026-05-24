package com.meetup.meetingservice.service;

import com.meetup.meetingservice.dto.ChatInfoResponse;
import com.meetup.meetingservice.dto.ChatMessageResponse;
import com.meetup.meetingservice.dto.CreateMeetingRequest;
import com.meetup.meetingservice.dto.JoinMeetingRequest;
import com.meetup.meetingservice.dto.JoinMeetingResponse;
import com.meetup.meetingservice.dto.MeetingResponse;
import com.meetup.meetingservice.dto.PostChatMessageRequest;
import com.meetup.meetingservice.dto.UpdateMeetingRequest;
import com.meetup.meetingservice.exception.MeetingNotFoundException;
import com.meetup.meetingservice.exception.MeetingValidationException;
import com.meetup.meetingservice.integration.streamchat.StreamChatChannel;
import com.meetup.meetingservice.integration.streamchat.StreamChatClient;
import com.meetup.meetingservice.integration.streamchat.StreamChatToken;
import com.meetup.meetingservice.integration.streamvideo.StreamVideoCall;
import com.meetup.meetingservice.integration.streamvideo.StreamVideoClient;
import com.meetup.meetingservice.integration.streamvideo.StreamVideoToken;
import com.meetup.meetingservice.mapper.MeetingMapper;
import com.meetup.meetingservice.model.Meeting;
import com.meetup.meetingservice.model.MeetingChatMessage;
import com.meetup.meetingservice.model.MeetingStatus;
import com.meetup.meetingservice.model.MeetingParticipant;
import com.meetup.meetingservice.model.ParticipantRole;
import com.meetup.meetingservice.repository.MeetingRepository;
import com.meetup.meetingservice.security.CurrentUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class MeetingServiceImpl implements MeetingService {

    private final MeetingRepository meetingRepository;
    private final StreamVideoClient streamVideoClient;
    private final StreamChatClient streamChatClient;
    private final MeetingMapper meetingMapper;
    private final CurrentUserService currentUserService;

    public MeetingServiceImpl(
            MeetingRepository meetingRepository,
            StreamVideoClient streamVideoClient,
            StreamChatClient streamChatClient,
            MeetingMapper meetingMapper,
            CurrentUserService currentUserService
    ) {
        this.meetingRepository = meetingRepository;
        this.streamVideoClient = streamVideoClient;
        this.streamChatClient = streamChatClient;
        this.meetingMapper = meetingMapper;
        this.currentUserService = currentUserService;
    }

    @Override
    public MeetingResponse createMeeting(CreateMeetingRequest request) {
        validateCreateRequest(request);

        UUID ownerId = resolveOwnerId(request.createdBy());
        String ownerName = currentUserService.getCurrentDisplayName();

        Instant now = Instant.now();
        Meeting meeting = new Meeting();
        meeting.setId(UUID.randomUUID());
        meeting.setTitle(request.title().trim());
        meeting.setTweenId(request.tweenId());
        meeting.setCreatedBy(ownerId);
        meeting.setScheduledAt(request.scheduledAt());
        meeting.setStatus(MeetingStatus.SCHEDULED);
        meeting.setMaxParticipants(request.maxParticipants());
        meeting.setCreatedAt(now);
        meeting.setUpdatedAt(now);

        if (!Boolean.FALSE.equals(request.createStreamCall())) {
            StreamVideoCall call = streamVideoClient.createCall(meeting.getId());
            meeting.setStreamCallId(call.callId());
            meeting.setStreamCallType(call.callType());
            meeting.setStreamCallCreated(true);
        }

        StreamChatChannel channel = streamChatClient.createChannel(meeting.getId());
        meeting.setStreamChannelId(channel.channelId());
        meeting.setStreamChannelType(channel.channelType());

        addParticipant(meeting, ownerId, ownerName, ParticipantRole.HOST);

        meetingRepository.save(meeting);
        return meetingMapper.toResponse(meeting);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MeetingResponse> getMeetings() {
        return meetingRepository.findAll().stream()
                .map(meetingMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MeetingResponse getMeeting(UUID meetingId) {
        return meetingMapper.toResponse(getMeetingOrThrow(meetingId));
    }

    @Override
    public MeetingResponse updateMeeting(UUID meetingId, UpdateMeetingRequest request) {
        Meeting meeting = getMeetingOrThrow(meetingId);

        if (request.title() != null && !request.title().isBlank()) {
            meeting.setTitle(request.title().trim());
        }
        if (request.scheduledAt() != null) {
            meeting.setScheduledAt(request.scheduledAt());
        }
        if (request.status() != null) {
            meeting.setStatus(request.status());
            if (request.status() == MeetingStatus.ONGOING && meeting.getStartedAt() == null) {
                meeting.setStartedAt(Instant.now());
            }
            if ((request.status() == MeetingStatus.COMPLETED || request.status() == MeetingStatus.CANCELLED)
                    && meeting.getEndedAt() == null) {
                meeting.setEndedAt(Instant.now());
            }
        }

        meeting.setUpdatedAt(Instant.now());
        meetingRepository.save(meeting);
        return meetingMapper.toResponse(meeting);
    }

    @Override
    public JoinMeetingResponse joinMeeting(UUID meetingId, JoinMeetingRequest request) {
        Meeting meeting = getMeetingOrThrow(meetingId);
        String effectiveUserName = request.userName() == null || request.userName().isBlank()
                ? "User " + request.userId()
                : request.userName();

        if (meeting.getStreamCallId() == null || meeting.getStreamCallType() == null) {
            StreamVideoCall call = streamVideoClient.createCall(meeting.getId());
            meeting.setStreamCallId(call.callId());
            meeting.setStreamCallType(call.callType());
            meeting.setStreamCallCreated(true);
            meeting.setUpdatedAt(Instant.now());
            meetingRepository.save(meeting);
        }

        if (meeting.getStreamChannelId() == null || meeting.getStreamChannelType() == null) {
            StreamChatChannel channel = streamChatClient.createChannel(meeting.getId());
            meeting.setStreamChannelId(channel.channelId());
            meeting.setStreamChannelType(channel.channelType());
            meeting.setUpdatedAt(Instant.now());
            meetingRepository.save(meeting);
        }

        StreamVideoToken videoToken = streamVideoClient.createUserToken(
                new StreamVideoCall(meeting.getStreamCallId(), meeting.getStreamCallType()),
                request.userId(),
                effectiveUserName
        );
        StreamChatToken chatToken = streamChatClient.createUserToken(
                new StreamChatChannel(meeting.getStreamChannelId(), meeting.getStreamChannelType()),
                request.userId(),
                effectiveUserName
        );

        MeetingParticipant participant = addParticipant(
                meeting,
                request.userId(),
                effectiveUserName,
                meeting.getCreatedBy().equals(request.userId()) ? ParticipantRole.HOST : ParticipantRole.MEMBER
        );
        meeting.setUpdatedAt(Instant.now());
        meetingRepository.save(meeting);

        return meetingMapper.toJoinResponse(meeting, videoToken, chatToken, participant);
    }

    @Override
    @Transactional(readOnly = true)
    public ChatInfoResponse getChatInfo(UUID meetingId) {
        return meetingMapper.toChatInfoResponse(getMeetingOrThrow(meetingId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> listMessages(UUID meetingId) {
        return meetingMapper.toChatMessageResponses(getMeetingOrThrow(meetingId));
    }

    @Override
    public ChatMessageResponse postMessage(UUID meetingId, PostChatMessageRequest request) {
        if (request.message() == null || request.message().isBlank()) {
            throw new MeetingValidationException("message must not be blank");
        }

        Meeting meeting = getMeetingOrThrow(meetingId);
        MeetingParticipant participant = addParticipant(
                meeting,
                request.userId(),
                request.userName().trim(),
                meeting.getCreatedBy().equals(request.userId()) ? ParticipantRole.HOST : ParticipantRole.MEMBER
        );

        MeetingChatMessage message = new MeetingChatMessage();
        message.setId(UUID.randomUUID());
        message.setMeetingId(meetingId);
        message.setUserId(request.userId());
        message.setDisplayName(participant.getDisplayName());
        message.setMessage(request.message().trim());
        message.setSentAt(Instant.now());
        meeting.getChatMessages().add(message);
        meeting.setUpdatedAt(Instant.now());
        meetingRepository.save(meeting);

        return meetingMapper.toChatMessageResponse(message);
    }

    private Meeting getMeetingOrThrow(UUID meetingId) {
        return meetingRepository.findById(meetingId)
                .orElseThrow(() -> new MeetingNotFoundException(meetingId));
    }

    private UUID resolveOwnerId(UUID requestedOwnerId) {
        if (requestedOwnerId != null) {
            return requestedOwnerId;
        }
        return currentUserService.getCurrentUserId()
                .orElseThrow(() -> new MeetingValidationException(
                        "createdBy is required when dev impersonation is disabled (send createdBy or X-User-Id)"
                ));
    }

    private MeetingParticipant addParticipant(
            Meeting meeting,
            UUID userId,
            String displayName,
            ParticipantRole role
    ) {
        MeetingParticipant existing = meeting.getParticipants().stream()
                .filter(participant -> participant.getUserId().equals(userId))
                .findFirst()
                .orElse(null);

        if (existing != null) {
            if (displayName != null && !displayName.isBlank()) {
                existing.setDisplayName(displayName);
            }
            if (role == ParticipantRole.HOST) {
                existing.setRole(ParticipantRole.HOST);
            }
            if (existing.getJoinedAt() == null) {
                existing.setJoinedAt(Instant.now());
            }
            return existing;
        }

        if (requestExceedsCapacity(meeting)) {
            throw new MeetingValidationException("Meeting has reached its participant limit");
        }

        MeetingParticipant participant = new MeetingParticipant();
        participant.setId(UUID.randomUUID());
        participant.setMeetingId(meeting.getId());
        participant.setUserId(userId);
        participant.setDisplayName(displayName);
        participant.setRole(role);
        participant.setJoinedAt(Instant.now());
        meeting.getParticipants().add(participant);
        return participant;
    }

    private boolean requestExceedsCapacity(Meeting meeting) {
        if (meeting.getMaxParticipants() == null) {
            return false;
        }
        return meeting.getParticipants().size() >= meeting.getMaxParticipants();
    }

    private void validateCreateRequest(CreateMeetingRequest request) {
        if (request.maxParticipants() != null && request.maxParticipants() <= 0) {
            throw new MeetingValidationException("maxParticipants must be greater than zero");
        }
    }
}
