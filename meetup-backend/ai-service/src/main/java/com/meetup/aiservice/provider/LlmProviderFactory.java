package com.meetup.aiservice.provider;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Factory — the only class that knows about application.yml's active-provider.
 * The pipeline calls getActiveProvider() and never touches config itself.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LlmProviderFactory {

    private final LlmProviderRegistry registry;

    @Value("${meetup.ai.active-provider}")
    private String activeProviderName;

    public LlmProvider getActiveProvider() {
        log.debug("Resolving active LLM provider: {}", activeProviderName);
        return registry.get(activeProviderName);
    }
}