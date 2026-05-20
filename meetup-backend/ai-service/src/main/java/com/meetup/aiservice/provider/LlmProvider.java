package com.meetup.aiservice.provider;

import com.meetup.aiservice.model.SnapshotResponse;
import com.meetup.aiservice.model.SummaryResult;

/**
 * Strategy interface for LLM providers.
 * The pipeline only ever calls this — never a concrete provider directly.
 */
public interface LlmProvider {

    /**
     * Generate a structured summary from a meeting snapshot.
     * Implementations are responsible for prompt construction and response parsing.
     */
    SummaryResult generate(SnapshotResponse snapshot);

    /** Human-readable provider name, used in logs */
    String name();
}

