package com.meetup.aiservice.service;


import com.meetup.aiservice.cache.SummaryCache;
import com.meetup.aiservice.model.SummariseRequest;
import com.meetup.aiservice.model.SummaryResult;
import com.meetup.aiservice.provider.LlmProviderFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Core pipeline orchestrator.
 *
 * Stage flow:
 *   1. Cache B check (Redis) ← skip if forceRefresh
 *   2. Snapshot fetch        ← GET /context/snapshot (Context Service handles Cache A)
 *   3. LLM call              ← via active provider
 *   4. Cache B write         ← TTL based on meeting state
 *   5. Output dispatch       ← Context Service + Task Service
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AiPipelineService {

    private final SummaryCache summaryCache;
    private final SnapshotClient  snapshotClient;
    private final LlmProviderFactory providerFactory;
    private final OutputDispatcher outputDispatcher;

    public SummaryResult summarise(SummariseRequest request) {
        var meetingId = request.getMeetingId();
        log.info("Pipeline triggered for meeting {}", meetingId);

        // Stage 1 — Cache B check
        if (!request.isForceRefresh()) {
            var cached = summaryCache.get(meetingId);
            if (cached.isPresent()) {
                log.info("Returning cached summary for meeting {}", meetingId);
                return cached.get();
            }
        }

        // Stage 2 — Fetch snapshot from Context Service (Cache A lives there)
        var snapshot = snapshotClient.fetchSnapshot(meetingId);
        log.debug("Snapshot fetched for meeting {}: {} participants, {} tasks, {} groups",
                meetingId,
                snapshot.getParticipants() != null ? snapshot.getParticipants().size() : 0,
                snapshot.getTasks() != null ? snapshot.getTasks().size() : 0,
                snapshot.getGroups() != null ? snapshot.getGroups().size() : 0);

        // Stage 3 — LLM call via active provider
        var provider = providerFactory.getActiveProvider();
        var result   = provider.generate(snapshot);

        // Stage 4 — Write to Cache B with TTL based on meeting state
        summaryCache.put(result, snapshot.isMeetingComplete());

        // Stage 5 — Dispatch to Context Service and Task Service
        outputDispatcher.dispatch(result);

        return result;
    }
}

