package com.meetup.aiservice.service;


import com.meetup.aiservice.model.SummaryResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Dispatches the SummaryResult to downstream services after generation.
 * Failures here are logged but do not fail the pipeline — the summary
 * was already generated and cached.
 */
@Slf4j
@Component
public class OutputDispatcher {

    private final WebClient contextClient;
    private final WebClient taskClient;

    public OutputDispatcher(
            @Value("${meetup.services.context-service-url}") String contextServiceUrl,
            @Value("${meetup.services.task-service-url}") String taskServiceUrl) {
        this.contextClient = WebClient.builder().baseUrl(contextServiceUrl).build();
        this.taskClient    = WebClient.builder().baseUrl(taskServiceUrl).build();
    }

    public void dispatch(SummaryResult result) {
        postSummaryToContextService(result);
        postDraftTasksToTaskService(result);
    }

    private void postSummaryToContextService(SummaryResult result) {
        try {
            contextClient.post()
                    .uri("/context/summary")
                    .bodyValue(result)
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            log.info("Summary posted to Context Service for meeting {}", result.getMeetingId());
        } catch (Exception e) {
            log.error("Failed to post summary to Context Service for meeting {}: {}",
                    result.getMeetingId(), e.getMessage());
        }
    }

    private void postDraftTasksToTaskService(SummaryResult result) {
        if (result.getSuggestedTasks() == null || result.getSuggestedTasks().isEmpty()) return;

        try {
            taskClient.post()
                    .uri("/tasks/draft-batch")
                    .bodyValue(result.getSuggestedTasks())
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            log.info("Posted {} draft tasks to Task Service for meeting {}",
                    result.getSuggestedTasks().size(), result.getMeetingId());
        } catch (Exception e) {
            log.error("Failed to post draft tasks to Task Service for meeting {}: {}",
                    result.getMeetingId(), e.getMessage());
        }
    }
}

