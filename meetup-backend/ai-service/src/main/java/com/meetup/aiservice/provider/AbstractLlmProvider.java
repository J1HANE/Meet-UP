package com.meetup.aiservice.provider;

import com.meetup.aiservice.exception.LlmCallException;
import com.meetup.aiservice.model.SnapshotResponse;
import com.meetup.aiservice.model.SummaryResult;
import com.meetup.aiservice.prompt.PromptBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;

/**
 * Shared logic for all providers: prompt construction, LLM call, JSON parsing.
 * Concrete providers supply only their ChatModel — everything else lives here.
 */
@Slf4j
@RequiredArgsConstructor
public abstract class AbstractLlmProvider implements LlmProvider {

    protected final PromptBuilder promptBuilder;
    protected final ObjectMapper objectMapper;

    /** Concrete providers return their Spring AI ChatModel */
    protected abstract ChatModel chatModel();

    @Override
    public SummaryResult generate(SnapshotResponse snapshot) {
        log.info("[{}] Generating summary for meeting {}", name(), snapshot.getMeetingId());

        var systemMessage = new SystemMessage(promptBuilder.buildSystemPrompt());
        var userMessage   = new UserMessage(promptBuilder.buildUserPrompt(snapshot));
        var prompt        = new Prompt(java.util.List.of(systemMessage, userMessage));

        var rawResponse = callWithRetry(prompt);
        var result      = parseResponse(rawResponse, snapshot.getMeetingId());

        result.setMeetingId(snapshot.getMeetingId());
        result.setGeneratedAt(Instant.now());

        log.info("[{}] Summary generated for meeting {}: {} decisions, {} suggested tasks",
                name(), snapshot.getMeetingId(),
                result.getDecisions() != null ? result.getDecisions().size() : 0,
                result.getSuggestedTasks() != null ? result.getSuggestedTasks().size() : 0);

        return result;
    }

    private String callWithRetry(Prompt prompt) {
        int attempts = 0;
        Exception lastException = null;

        while (attempts < 2) {
            try {
                var response = chatModel().call(prompt);
                return response.getResult().getOutput().getContent();
            } catch (Exception e) {
                lastException = e;
                attempts++;
                log.warn("[{}] LLM call attempt {} failed: {}", name(), attempts, e.getMessage());
            }
        }

        throw new LlmCallException("LLM call failed after 2 attempts", lastException);
    }

    private SummaryResult parseResponse(String raw, String meetingId) {
        // Strip markdown code fences if the LLM included them anyway
        var cleaned = raw.strip();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned
                    .replaceAll("^```(?:json)?\\n?", "")
                    .replaceAll("```$", "")
                    .strip();
        }

        try {
            return objectMapper.readValue(cleaned, SummaryResult.class);
        } catch (Exception e) {
            log.error("[{}] Failed to parse LLM response for meeting {}: {}",
                    name(), meetingId, e.getMessage());
            log.debug("Raw LLM response was: {}", raw);
            // Return a degraded result rather than failing the whole request
            return buildFallbackResult(meetingId, raw);
        }
    }

    private SummaryResult buildFallbackResult(String meetingId, String rawText) {
        var result = new SummaryResult();
        result.setNarrative("Summary could not be parsed. Raw output: "
                + rawText.substring(0, Math.min(rawText.length(), 300)));
        result.setDecisions(java.util.List.of());
        result.setSuggestedTasks(java.util.List.of());
        result.setGroupInsights(java.util.List.of());
        result.setOpenQuestions(java.util.List.of());
        return result;
    }
}

