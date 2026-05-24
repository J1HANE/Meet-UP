package com.meetup.meetingservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PostChatMessageRequest(
        @NotNull UUID userId,
        @NotBlank String userName,
        @NotBlank String message
) {
}
