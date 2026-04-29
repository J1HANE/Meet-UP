package com.meetup.meetingservice.integration.stream;

import com.meetup.meetingservice.exception.ErrorCode;
import com.meetup.meetingservice.exception.MeetingException;
import io.getstream.exceptions.StreamException;
import io.getstream.models.CallRequest;
import io.getstream.models.GetOrCreateCallRequest;
import io.getstream.services.framework.StreamSDKClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
@Profile("!mock")
public class StreamVideoClient {

    private final String apiKey;
    private final StreamSDKClient streamClient;

    public StreamVideoClient(@Value("${stream.api.key:}") String apiKey,
                             @Value("${stream.api.secret:}") String apiSecret) {
        this.apiKey = apiKey;
        validateCredentials(apiKey, apiSecret);
        this.streamClient = new StreamSDKClient(apiKey, apiSecret);
    }

    public StreamVideoCall createCall(String meetingId) {
        try {
            GetOrCreateCallRequest request = GetOrCreateCallRequest.builder()
                    .data(CallRequest.builder().build())
                    .build();
            streamClient.video().call("default", meetingId).getOrCreate(request);
            return new StreamVideoCall("default", meetingId);
        } catch (StreamException ex) {
            throw new MeetingException(
                    ErrorCode.STREAM_API_ERROR,
                    "Failed to create Stream Video call for meeting " + meetingId,
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

    public record StreamVideoCall(String callType, String callId) {
    }
}
