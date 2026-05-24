package com.meetup.meetingservice.integration.streamchat;

import java.util.UUID;

public interface StreamChatClient {
    StreamChatChannel createChannel(UUID meetingId);

    StreamChatToken createUserToken(StreamChatChannel channel, UUID userId, String userName);
}
