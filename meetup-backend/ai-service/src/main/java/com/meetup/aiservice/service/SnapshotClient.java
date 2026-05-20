package com.meetup.aiservice.service;

import com.meetup.aiservice.model.SnapshotResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * HTTP client for GET /context/snapshot.
 * Cache A lives inside the Context Service — this client doesn't need to
 * know about it. It just calls the endpoint; Context Service handles caching.
 */
@Slf4j
@Component
public class SnapshotClient {

    private final WebClient webClient;

    public SnapshotClient(@Value("${meetup.services.context-service-url}") String contextServiceUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(contextServiceUrl)
                .build();
    }

    public SnapshotResponse fetchSnapshot(String meetingId) {
        log.debug("Fetching snapshot for meeting {}", meetingId);
        return webClient.get()
                .uri("/context/snapshot?meetingId={id}", meetingId)
                .retrieve()
                .bodyToMono(SnapshotResponse.class)
                .block();  // blocking is fine — we're not in a reactive pipeline
    }
}
