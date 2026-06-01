package com.meetup.meetingservice.service;

import com.meetup.meetingservice.dto.AddParticipantRequest;
import com.meetup.meetingservice.dto.ChatInfoResponse;
import com.meetup.meetingservice.dto.ChatMessageResponse;
import com.meetup.meetingservice.dto.CreateMeetingRequest;
import com.meetup.meetingservice.dto.JoinMeetingRequest;
import com.meetup.meetingservice.dto.JoinMeetingResponse;
import com.meetup.meetingservice.dto.MeetingResponse;
import com.meetup.meetingservice.dto.ParticipantResponse;
import com.meetup.meetingservice.dto.PostChatMessageRequest;
import com.meetup.meetingservice.dto.RemoveParticipantRequest;
import com.meetup.meetingservice.dto.UpdateMeetingRequest;

import java.util.List;
import java.util.UUID;

public interface MeetingService {
    MeetingResponse createMeeting(CreateMeetingRequest request);

    List<MeetingResponse> getMeetings();

    MeetingResponse getMeeting(UUID meetingId);

    MeetingResponse updateMeeting(UUID meetingId, UpdateMeetingRequest request);

    JoinMeetingResponse joinMeeting(UUID meetingId, JoinMeetingRequest request);

    ChatInfoResponse getChatInfo(UUID meetingId);

    List<ChatMessageResponse> listMessages(UUID meetingId);

    ChatMessageResponse postMessage(UUID meetingId, PostChatMessageRequest request);

    ParticipantResponse addParticipant(UUID meetingId, AddParticipantRequest request);

    void removeParticipant(UUID meetingId, RemoveParticipantRequest request);
}
