package com.meetup.meetingservice.dto;

import com.meetup.meetingservice.model.ParticipantRole;

import java.time.Instant;
import java.util.UUID;

public record ParticipantResponse(
        UUID userId,
        String displayName,
        ParticipantRole role,
        Instant joinedAt
) {
}
