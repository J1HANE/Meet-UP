package com.meetup.contextservice.client;

import com.meetup.contextservice.dto.TaskSnapshot;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
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
public class TaskServiceClient {

    private final RestTemplate restTemplate;

    @Value("${task.service.url:http://localhost:8091}")
    private String taskServiceUrl;

    @Value("${task.service.enabled:true}")
    private boolean taskServiceEnabled;

    private static final ParameterizedTypeReference<List<Map<String, Object>>> RESPONSE_TYPE =
            new ParameterizedTypeReference<>() {};

    @CircuitBreaker(name = "taskService", fallbackMethod = "getTasksByMeetingIdFallback")
    public List<Map<String, Object>> getTasksByMeetingId(String meetingId) {
        if (!taskServiceEnabled) {
            log.debug("Task service is disabled, skipping task fetch for meeting: {}", meetingId);
            return List.of();
        }

        String url = String.format("%s/api/tasks/context/%s/tasks/snapshot", taskServiceUrl, meetingId);
        log.info("Fetching tasks from task service: {}", url);

        List<Map<String, Object>> tasks = getMaps(meetingId, url, restTemplate, RESPONSE_TYPE, log);
        if (tasks != null) return tasks;


        log.warn("No tasks found for meeting: {}", meetingId);
        return List.of();
    }




    public List<TaskSnapshot> getTasksByMeetingIdFallback(String meetingId, HttpClientErrorException.NotFound e) {
        log.warn("Task service returned 404 for meeting: {}", meetingId);
        return List.of();
    }

    public List<TaskSnapshot> getTasksByMeetingIdFallback(String meetingId, ResourceAccessException e) {
        log.warn("Task service is unavailable (connection refused) for meeting: {}", meetingId);
        return List.of();
    }

    public List<TaskSnapshot> getTasksByMeetingIdFallback(String meetingId, Exception e) {
        log.error("Task service circuit breaker triggered for meeting: {}", meetingId, e);
        return List.of();
    }
}