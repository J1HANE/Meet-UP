package com.meetup.meetingservice.integration.stream;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("mock")
public class MockProfileStreamVideoClient extends StreamVideoClient {

    private final StreamMockClient streamMockClient;

    public MockProfileStreamVideoClient(StreamMockClient streamMockClient) {
        // Use a dummy key with sufficient length to avoid JWT key size error
        super("mock-api-key-with-sufficient-length-to-avoid-jwt-error-1234567890", 
              "mock-api-secret-with-sufficient-length-to-avoid-jwt-error-1234567890");
        this.streamMockClient = streamMockClient;
    }

    @Override
    public StreamVideoCall createCall(String meetingId) {
        return streamMockClient.createVideoCall(meetingId);
    }

    @Override
    public String generateUserToken(String userId) {
        return streamMockClient.generateUserToken(userId);
    }

    @Override
    public String getApiKey() {
        return streamMockClient.getApiKey();
    }
}
