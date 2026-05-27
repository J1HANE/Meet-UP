package com.meetup.contextservice.client;


import com.meetup.contextservice.dto.AggregatedSnapshot;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

@Component
@Slf4j
public class SnapshotAggregatorClient {

    private final TaskServiceClient taskServiceClient;
    private final TweeningServiceClient tweeningServiceClient;
    private final Executor executor;

    public SnapshotAggregatorClient(TaskServiceClient taskServiceClient,
                                    TweeningServiceClient tweeningServiceClient,
                                    @Qualifier("snapshotExecutor") Executor taskExecutor) {
        this.taskServiceClient = taskServiceClient;
        this.tweeningServiceClient = tweeningServiceClient;
        this.executor = taskExecutor;
    }

    public AggregatedSnapshot fetchSnapshot(String meetingId) {
        log.info("Aggregating snapshot for meeting: {}", meetingId);

        CompletableFuture<List<Map<String, Object>>> tasksFuture = CompletableFuture
                .supplyAsync(() -> taskServiceClient.getTasksByMeetingId(meetingId), executor)
                .exceptionally(ex -> {
                    log.error("Failed to fetch tasks for meeting: {}", meetingId, ex);
                    return List.of();
                });

        CompletableFuture<List<Map<String, Object>>> groupsFuture = CompletableFuture
                .supplyAsync(() -> tweeningServiceClient.getGroupsByMeetingId(meetingId), executor)
                .exceptionally(ex -> {
                    log.error("Failed to fetch groups for meeting: {}", meetingId, ex);
                    return List.of();
                });

        CompletableFuture.allOf(tasksFuture, groupsFuture).join();

        List<Map<String, Object>> tasks = tasksFuture.join();
        List<Map<String, Object>> groups = groupsFuture.join();

        log.info("Aggregated snapshot for meeting: {} — {} tasks, {} groups",
                meetingId, tasks.size(), groups.size());

        return new AggregatedSnapshot(tasks, groups);
    }


}