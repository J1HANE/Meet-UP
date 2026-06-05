package com.meetup.meetingservice.mapper;

import com.meetup.meetingservice.dto.ChatInfoResponse;
import com.meetup.meetingservice.dto.ChatMessageResponse;
import com.meetup.meetingservice.dto.JoinMeetingResponse;
import com.meetup.meetingservice.dto.MeetingResponse;
import com.meetup.meetingservice.dto.ParticipantResponse;
import com.meetup.meetingservice.model.MeetingChatMessage;
import com.meetup.meetingservice.integration.streamchat.StreamChatToken;
import com.meetup.meetingservice.integration.streamvideo.StreamVideoToken;
import com.meetup.meetingservice.model.Meeting;
import com.meetup.meetingservice.model.MeetingParticipant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MeetingMapper {

    private final String streamApiKey;

    public MeetingMapper(@Value("${stream.api-key:stream-dev-key}") String streamApiKey) {
        this.streamApiKey = streamApiKey;
    }

    public MeetingResponse toResponse(Meeting meeting) {
        return new MeetingResponse(
                meeting.getId(),
                meeting.getTitle(),
                meeting.getTweenId(),
                meeting.getCreatedBy(),
                meeting.getScheduledAt(),
                meeting.getStatus(),
                meeting.getMaxParticipants(),
                meeting.getStreamCallId(),
                meeting.getStreamCallType(),
                meeting.getStreamChannelId(),
                meeting.getStreamChannelType(),
                meeting.getCreatedAt(),
                meeting.getUpdatedAt(),
                toParticipantResponses(meeting),
                meeting.getNotes()
        );
    }

    public JoinMeetingResponse toJoinResponse(
            Meeting meeting,
            StreamVideoToken videoToken,
            StreamChatToken chatToken,
            MeetingParticipant participant
    ) {
        return new JoinMeetingResponse(
                meeting.getId(),
                new JoinMeetingResponse.StreamVideoInfo(
                        streamApiKey,
                        meeting.getStreamCallId(),
                        meeting.getStreamCallType(),
                        videoToken.token()
                ),
                toChatInfoResponse(meeting, chatToken.userToken()),
                toParticipantResponse(participant)
        );
    }

    public ParticipantResponse toParticipantResponse(MeetingParticipant participant) {
        return new ParticipantResponse(
                participant.getUserId(),
                participant.getDisplayName(),
                participant.getRole(),
                participant.getJoinedAt()
        );
    }

    public List<ParticipantResponse> toParticipantResponses(Meeting meeting) {
        return meeting.getParticipants().stream()
                .map(this::toParticipantResponse)
                .toList();
    }

    public ChatMessageResponse toChatMessageResponse(MeetingChatMessage message) {
        return new ChatMessageResponse(
                message.getId(),
                message.getUserId(),
                message.getDisplayName(),
                message.getMessage(),
                message.getSentAt()
        );
    }

    public List<ChatMessageResponse> toChatMessageResponses(Meeting meeting) {
        return meeting.getChatMessages().stream()
                .map(this::toChatMessageResponse)
                .toList();
    }

    public ChatInfoResponse toChatInfoResponse(Meeting meeting) {
        return toChatInfoResponse(meeting, null);
    }

    public ChatInfoResponse toChatInfoResponse(Meeting meeting, String userToken) {
        String meetingId = meeting.getId().toString();
        return new ChatInfoResponse(
                streamApiKey,
                meeting.getStreamChannelId() != null ? meeting.getStreamChannelId() : "meeting-" + meetingId,
                meeting.getStreamChannelType(),
                userToken
        );
    }
}
