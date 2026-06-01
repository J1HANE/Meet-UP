package com.meetup.meetingservice.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record RemoveParticipantRequest(
        @NotNull UUID userId
) {
}
