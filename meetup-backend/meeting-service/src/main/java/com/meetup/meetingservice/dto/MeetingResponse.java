package com.meetup.meetingservice.dto;

import com.meetup.meetingservice.model.MeetingStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record MeetingResponse(
        UUID id,
        String title,
        UUID tweenId,
        UUID createdBy,
        Instant scheduledAt,
        MeetingStatus status,
        Integer maxParticipants,
        String streamCallId,
        String streamCallType,
        String streamChannelId,
        String streamChannelType,
        Instant createdAt,
        Instant updatedAt,
        List<ParticipantResponse> participants
) {
}
