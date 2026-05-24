package com.meetup.meetingservice.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public record CreateMeetingRequest(
        @NotBlank String title,
        @NotNull UUID tweenId,
        UUID createdBy,
        @NotNull @Future Instant scheduledAt,
        Integer maxParticipants,
        Boolean createStreamCall
) {
}
