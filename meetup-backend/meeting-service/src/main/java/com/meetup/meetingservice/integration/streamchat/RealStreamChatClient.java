package com.meetup.meetingservice.integration.streamchat;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.UUID;

// Real Stream Chat client - disabled until Stream Java SDK is available in Maven
// Currently using enhanced mock clients with real credentials
// @Component
// @Primary
// @ConditionalOnProperty(name = "stream.api-secret", matchIfMissing = false, havingValue = "replace-me", negate = true)
public class RealStreamChatClient implements StreamChatClient {

    private final String defaultChannelType;

    public RealStreamChatClient(
            @Value("${stream.chat.default-channel-type:messaging}") String defaultChannelType
    ) {
        this.defaultChannelType = defaultChannelType;
    }

    @Override
    public StreamChatChannel createChannel(UUID meetingId) {
        // Real implementation would use Stream Java SDK
        return new StreamChatChannel("meeting-" + meetingId, defaultChannelType);
    }

    @Override
    public StreamChatToken createUserToken(StreamChatChannel channel, UUID userId, String userName) {
        // Real implementation would use Stream Java SDK
        String safeName = userName == null || userName.isBlank() ? "user" : userName.trim().replace(" ", "-");
        return new StreamChatToken("real-stream-chat-token-" + channel.channelId() + "-" + userId + "-" + safeName);
    }
}
