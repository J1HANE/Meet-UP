package com.meetup.aiservice.provider;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;

/**
 * Registry — Spring auto-populates the Map<String, LlmProvider>
 * using each provider's bean name as the key.
 * Adding a new provider = new @Component("name") class. Nothing else changes.
 */
@Slf4j
@Component
public class LlmProviderRegistry {

    private final Map<String, LlmProvider> providers;

    public LlmProviderRegistry(Map<String, LlmProvider> providers) {
        this.providers = providers;
        log.info("LlmProviderRegistry initialised with providers: {}", providers.keySet());
    }

    public LlmProvider get(String name) {
        return Optional.ofNullable(providers.get(name))
                .orElseThrow(() -> new IllegalArgumentException(
                        "Unknown LLM provider: '%s'. Available: %s".formatted(name, providers.keySet())));
    }
}
