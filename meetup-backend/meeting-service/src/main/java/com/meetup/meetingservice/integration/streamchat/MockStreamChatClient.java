package com.meetup.meetingservice.integration.streamchat;

import com.meetup.meetingservice.integration.StreamTokenGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@Primary
public class MockStreamChatClient implements StreamChatClient {

    private final String defaultChannelType;
    private final StreamTokenGenerator streamTokenGenerator;

    public MockStreamChatClient(
            @Value("${stream.chat.default-channel-type:messaging}") String defaultChannelType,
            StreamTokenGenerator streamTokenGenerator
    ) {
        this.defaultChannelType = defaultChannelType;
        this.streamTokenGenerator = streamTokenGenerator;
    }

    @Override
    public StreamChatChannel createChannel(UUID meetingId) {
        return new StreamChatChannel("meeting-" + meetingId, defaultChannelType);
    }

    @Override
    public StreamChatToken createUserToken(StreamChatChannel channel, UUID userId, String userName) {
        return new StreamChatToken(streamTokenGenerator.createUserToken(userId.toString()));
    }
}
