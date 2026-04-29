package com.meetup.meetingservice.integration.stream;

import com.meetup.meetingservice.exception.ErrorCode;
import com.meetup.meetingservice.exception.MeetingException;
import io.getstream.exceptions.StreamException;
import io.getstream.models.ChannelInput;
import io.getstream.models.ChannelMemberRequest;
import io.getstream.models.GetOrCreateChannelRequest;
import io.getstream.models.UpdateUsersRequest;
import io.getstream.models.UserRequest;
import io.getstream.services.framework.StreamSDKClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@Component
@Profile("!mock")
public class StreamChatClient {

    private final String apiKey;
    private final StreamSDKClient streamClient;

    public StreamChatClient(@Value("${stream.api.key:}") String apiKey,
                            @Value("${stream.api.secret:}") String apiSecret) {
        this.apiKey = apiKey;
        validateCredentials(apiKey, apiSecret);
        this.streamClient = new StreamSDKClient(apiKey, apiSecret);
    }

    public StreamChatChannel createChannel(String meetingId) {
        String creatorUserId = "meeting-host-" + meetingId;
        try {
            upsertUser(creatorUserId);
            GetOrCreateChannelRequest request = GetOrCreateChannelRequest.builder()
                    .data(ChannelInput.builder()
                            .createdByID(creatorUserId)
                            .members(List.of(ChannelMemberRequest.builder().userID(creatorUserId).build()))
                            .build())
                    .build();
            streamClient.chat().channel("messaging", meetingId).getOrCreate(request);
            return new StreamChatChannel("messaging", meetingId);
        } catch (StreamException ex) {
            throw new MeetingException(
                    ErrorCode.STREAM_API_ERROR,
                    "Failed to create Stream Chat channel for meeting " + meetingId,
                    ex
            );
        }
    }

    public String generateUserToken(String userId) {
        int expirationEpochSeconds = Math.toIntExact(Instant.now().plus(2, ChronoUnit.HOURS).getEpochSecond());
        return streamClient.tokenBuilder().createToken(userId, expirationEpochSeconds);
    }

    public String getApiKey() {
        return apiKey;
    }

    private void validateCredentials(String key, String secret) {
        if (key == null || key.isBlank() || secret == null || secret.isBlank()) {
            throw new MeetingException(
                    ErrorCode.STREAM_CONFIGURATION_ERROR,
                    "Stream credentials are missing. Set stream.api.key and stream.api.secret."
            );
        }
    }

    private void upsertUser(String userId) throws StreamException {
        UserRequest user = UserRequest.builder().id(userId).build();
        UpdateUsersRequest request = UpdateUsersRequest.builder()
                .users(Map.of(userId, user))
                .build();
        streamClient.updateUsers(request).execute();
    }

    public record StreamChatChannel(String channelType, String channelId) {
    }
}
