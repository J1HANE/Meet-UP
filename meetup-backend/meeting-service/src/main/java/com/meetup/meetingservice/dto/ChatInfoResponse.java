package com.meetup.meetingservice.dto;

public record ChatInfoResponse(
        String apiKey,
        String channelId,
        String channelType,
        String userToken
) {
}
