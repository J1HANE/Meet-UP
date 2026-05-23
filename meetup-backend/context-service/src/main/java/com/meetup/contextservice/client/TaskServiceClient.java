package com.meetup.contextservice.client;

import com.meetup.contextservice.dto.TaskSnapshot;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;

import java.util.List;
import java.util.UUID;

@Component
@Slf4j
@RequiredArgsConstructor
public class TaskServiceClient {

    private final RestTemplate restTemplate;

    @Value("${task.service.url:http://localhost:8091}")
    private String taskServiceUrl;

    @Value("${task.service.enabled:true}")
    private boolean taskServiceEnabled;

    public List<TaskSnapshot> getTasksByMeetingId(UUID meetingId) {
        if (!taskServiceEnabled) {
            log.debug("Task service is disabled, skipping task fetch for meeting: {}", meetingId);
            return List.of();
        }

        try {
            String url = String.format("%s/context/%s/tasks/snapshot", taskServiceUrl, meetingId);
            log.info("Fetching tasks from task service: {}", url);
            
            TaskSnapshot[] tasks = restTemplate.getForObject(url, TaskSnapshot[].class);
            
            if (tasks != null) {
                log.info("Successfully fetched {} tasks for meeting: {}", tasks.length, meetingId);
                return List.of(tasks);
            }
            
            log.warn("No tasks found for meeting: {}", meetingId);
            return List.of();
        } catch (HttpClientErrorException.NotFound e) {
            log.warn("Task service returned 404 for meeting: {}", meetingId);
            return List.of();
        } catch (ResourceAccessException e) {
            log.warn("Task service is unavailable (connection refused) for meeting: {}", meetingId);
            return List.of();
        } catch (Exception e) {
            log.error("Error fetching tasks from task service for meeting: {}", meetingId, e);
            return List.of();
        }
    }
}
