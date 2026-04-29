package com.meetup.meetingservice.service;

import com.meetup.meetingservice.dto.*;
import com.meetup.meetingservice.exception.ErrorCode;
import com.meetup.meetingservice.exception.MeetingException;
import com.meetup.meetingservice.integration.stream.StreamChatClient;
import com.meetup.meetingservice.integration.stream.StreamVideoClient;
import com.meetup.meetingservice.mapper.MeetingMapper;
import com.meetup.meetingservice.model.Meeting;
import com.meetup.meetingservice.model.MeetingParticipant;
import com.meetup.meetingservice.model.MeetingStatus;
import com.meetup.meetingservice.model.ParticipantRole;
import com.meetup.meetingservice.repository.MeetingRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final StreamVideoClient streamVideoClient;
    private final StreamChatClient streamChatClient;
    private final MeetingMapper meetingMapper;

    public MeetingService(MeetingRepository meetingRepository,
                          StreamVideoClient streamVideoClient,
                          StreamChatClient streamChatClient,
                          MeetingMapper meetingMapper) {
        this.meetingRepository = meetingRepository;
        this.streamVideoClient = streamVideoClient;
        this.streamChatClient = streamChatClient;
        this.meetingMapper = meetingMapper;
    }

    public MeetingResponse createMeeting(MeetingRequest request) {
        Meeting meeting = meetingMapper.toEntity(request);
        meeting.setStatus(MeetingStatus.SCHEDULED);
        meeting.setParticipants(new ArrayList<>());
        
        Meeting savedMeeting = meetingRepository.save(meeting);
        
        StreamVideoClient.StreamVideoCall videoCall = streamVideoClient.createCall(savedMeeting.getId());
        StreamChatClient.StreamChatChannel chatChannel = streamChatClient.createChannel(savedMeeting.getId());
        savedMeeting.setStreamCallType(videoCall.callType());
        savedMeeting.setStreamCallId(videoCall.callId());
        savedMeeting.setStreamChannelType(chatChannel.channelType());
        savedMeeting.setStreamChannelId(chatChannel.channelId());
        meetingRepository.save(savedMeeting);
        
        return meetingMapper.toResponse(savedMeeting);
    }

    public List<MeetingResponse> getAllMeetings() {
        return meetingRepository.findAll().stream()
                .map(meetingMapper::toResponse)
                .collect(Collectors.toList());
    }

    public MeetingResponse getMeeting(String id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new MeetingException(ErrorCode.MEETING_NOT_FOUND));
        return meetingMapper.toResponse(meeting);
    }

    public MeetingResponse updateMeeting(String id, MeetingRequest request) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new MeetingException(ErrorCode.MEETING_NOT_FOUND));
        
        if (request.getTitle() != null) meeting.setTitle(request.getTitle());
        if (request.getDescription() != null) meeting.setDescription(request.getDescription());
        if (request.getStartTime() != null) meeting.setStartTime(request.getStartTime());
        
        meetingRepository.save(meeting);
        return meetingMapper.toResponse(meeting);
    }

    public JoinMeetingResponse joinMeeting(String id, JoinMeetingRequest request) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new MeetingException(ErrorCode.MEETING_NOT_FOUND));
                
        String videoToken = streamVideoClient.generateUserToken(request.getUserId());
        String chatToken = streamChatClient.generateUserToken(request.getUserId());
        
        MeetingParticipant participant = new MeetingParticipant();
        participant.setUserId(request.getUserId());
        participant.setJoined(true);
        participant.setRole(ParticipantRole.MEMBER);
        participant.setStreamUserToken(videoToken);
        
        if (meeting.getParticipants() == null) {
            meeting.setParticipants(new ArrayList<>());
        }
        meeting.getParticipants().add(participant);
        meetingRepository.save(meeting);

        JoinMeetingResponse response = new JoinMeetingResponse();
        response.setMeetingId(meeting.getId());

        JoinMeetingResponse.VideoInfo videoInfo = new JoinMeetingResponse.VideoInfo();
        videoInfo.setCallType(meeting.getStreamCallType());
        videoInfo.setCallId(meeting.getStreamCallId());
        videoInfo.setToken(videoToken);
        response.setVideo(videoInfo);

        JoinMeetingResponse.ChatInfo chatInfo = new JoinMeetingResponse.ChatInfo();
        chatInfo.setApiKey(streamChatClient.getApiKey());
        chatInfo.setChannelType(meeting.getStreamChannelType());
        chatInfo.setChannelId(meeting.getStreamChannelId());
        chatInfo.setUserToken(chatToken);
        response.setChat(chatInfo);

        return response;
    }

    public ChatInfoResponse getChatInfo(String id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new MeetingException(ErrorCode.MEETING_NOT_FOUND));
                
        ChatInfoResponse response = new ChatInfoResponse();
        response.setMeetingId(meeting.getId());
        response.setApiKey(streamChatClient.getApiKey());
        response.setChannelType(meeting.getStreamChannelType());
        response.setChannelId(meeting.getStreamChannelId());
        
        return response;
    }
}
