package com.meetup.meetingservice.integration.streamvideo;

import java.util.UUID;

public interface StreamVideoClient {
    StreamVideoCall createCall(UUID meetingId);

    StreamVideoToken createUserToken(StreamVideoCall call, UUID userId, String userName);
}
