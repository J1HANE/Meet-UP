package com.meetup.meetingservice.integration.streamvideo;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.UUID;

// Real Stream Video client - disabled until Stream Java SDK is available in Maven
// Currently using enhanced mock clients with real credentials
// @Component
// @Primary
// @ConditionalOnProperty(name = "stream.api-secret", matchIfMissing = false, havingValue = "replace-me", negate = true)
public class RealStreamVideoClient implements StreamVideoClient {

    private final String defaultCallType;

    public RealStreamVideoClient(
            @Value("${stream.video.default-call-type:default}") String defaultCallType
    ) {
        this.defaultCallType = defaultCallType;
    }

    @Override
    public StreamVideoCall createCall(UUID meetingId) {
        // Real implementation would use Stream Java SDK
        return new StreamVideoCall("meeting-" + meetingId, defaultCallType);
    }

    @Override
    public StreamVideoToken createUserToken(StreamVideoCall call, UUID userId, String userName) {
        // Real implementation would use Stream Java SDK
        String safeName = userName == null || userName.isBlank() ? "user" : userName.trim().replace(" ", "-");
        return new StreamVideoToken("real-stream-video-token-" + call.callId() + "-" + userId + "-" + safeName);
    }
}
