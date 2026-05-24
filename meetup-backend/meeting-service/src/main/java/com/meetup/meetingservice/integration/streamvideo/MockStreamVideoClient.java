package com.meetup.meetingservice.integration.streamvideo;

import com.meetup.meetingservice.integration.StreamTokenGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@Primary
public class MockStreamVideoClient implements StreamVideoClient {

    private final String defaultCallType;
    private final StreamTokenGenerator streamTokenGenerator;

    public MockStreamVideoClient(
            @Value("${stream.video.default-call-type:default}") String defaultCallType,
            StreamTokenGenerator streamTokenGenerator
    ) {
        this.defaultCallType = defaultCallType;
        this.streamTokenGenerator = streamTokenGenerator;
    }

    @Override
    public StreamVideoCall createCall(UUID meetingId) {
        return new StreamVideoCall("meeting-" + meetingId, defaultCallType);
    }

    @Override
    public StreamVideoToken createUserToken(StreamVideoCall call, UUID userId, String userName) {
        return new StreamVideoToken(streamTokenGenerator.createUserToken(userId.toString()));
    }
}
