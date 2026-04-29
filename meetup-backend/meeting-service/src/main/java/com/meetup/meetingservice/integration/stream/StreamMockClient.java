package com.meetup.meetingservice.integration.stream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@Profile("mock")
public class StreamMockClient {

    @Value("${stream.api.key:mock-stream-api-key}")
    private String apiKey;

    public StreamVideoClient.StreamVideoCall createVideoCall(String meetingId) {
        return new StreamVideoClient.StreamVideoCall("default", meetingId);
    }

    public StreamChatClient.StreamChatChannel createChatChannel(String meetingId) {
        return new StreamChatClient.StreamChatChannel("messaging", meetingId);
    }

    public String generateUserToken(String userId) {
        return "mock-stream-token-" + userId + "-" + UUID.randomUUID();
    }

    public String getApiKey() {
        return apiKey;
    }
}
