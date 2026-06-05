package com.meetup.meetingservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AddParticipantRequest(
        @NotNull UUID userId,
        @NotBlank String userName,
        @Email String email
) {
}
