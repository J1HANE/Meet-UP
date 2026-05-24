package com.meetup.meetingservice.dto;

import java.time.Instant;
import java.util.UUID;

public record ChatMessageResponse(
        UUID id,
        UUID userId,
        String displayName,
        String message,
        Instant sentAt
) {
}
