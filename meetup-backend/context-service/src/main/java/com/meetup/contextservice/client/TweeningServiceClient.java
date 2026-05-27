package com.meetup.contextservice.client;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import static com.meetup.contextservice.utils.Utils.getMaps;

@Component
@Slf4j
@RequiredArgsConstructor
public class TweeningServiceClient {

    private final RestTemplate restTemplate;

    @Value("${tweening.service.url:http://localhost:8086}")
    private String tweeningServiceUrl;

    @Value("${tweening.service.enabled:true}")
    private boolean tweeningServiceEnabled;

    private static final ParameterizedTypeReference<List<Map<String, Object>>> RESPONSE_TYPE =
            new ParameterizedTypeReference<>() {};

    @CircuitBreaker(name = "tweeningService", fallbackMethod = "getGroupsByMeetingIdFallback")
    public List<Map<String, Object>> getGroupsByMeetingId(String meetingId) {
        if (!tweeningServiceEnabled) {
            log.debug("Tweening service is disabled, skipping fetch for meeting: {}", meetingId);
            return List.of();
        }

        String url = String.format("%s/api/groups/meeting/%s", tweeningServiceUrl, meetingId);
        log.info("Fetching groups from tweening service: {}", url);

        List<Map<String, Object>> groups = getMaps(meetingId, url, restTemplate, RESPONSE_TYPE, log);
        if (groups != null) return groups;

        log.warn("No groups found for meeting: {}", meetingId);
        return List.of();
    }

    public List<Map<String, Object>> getGroupsByMeetingIdFallback(String meetingId, HttpClientErrorException.NotFound e) {
        log.warn("Tweening service returned 404 for meeting: {}", meetingId);
        return List.of();
    }

    public List<Map<String, Object>> getGroupsByMeetingIdFallback(String meetingId, ResourceAccessException e) {
        log.warn("Tweening service is unavailable (connection refused) for meeting: {}", meetingId);
        return List.of();
    }

    public List<Map<String, Object>> getGroupsByMeetingIdFallback(String meetingId, Exception e) {
        log.error("Tweening service circuit breaker triggered for meeting: {}", meetingId, e);
        return List.of();
    }
}