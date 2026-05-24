package com.meetup.meetingservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.UUID;

public record JoinMeetingResponse(
        UUID meetingId,
        StreamVideoInfo video,
        ChatInfoResponse chat,
        ParticipantResponse participant
) {
    public record StreamVideoInfo(
            @JsonProperty("api_key") String apiKey,
            @JsonProperty("call_id") String callId,
            @JsonProperty("call_type") String callType,
            String token
    ) {
    }
}
