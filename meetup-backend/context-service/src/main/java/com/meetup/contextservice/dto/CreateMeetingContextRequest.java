package com.meetup.contextservice.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMeetingContextRequest {
    @NotEmpty(message = "Meeting ID is required")
    private UUID meetingId;

    @NotEmpty(message = "Participant IDs are required")
    private List<UUID> participantIds;

    @NotEmpty(message = "Tween group IDs are required")
    private List<UUID> tweenGroupIds;

    private String status;
}
