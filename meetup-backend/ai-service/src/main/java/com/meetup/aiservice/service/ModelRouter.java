package com.meetup.aiservice.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Routes requests to Ollama (local) or Gemini (cloud) based on complexity.
 *
 * Strategy:
 *  - SIMPLE queries (single-service data, Q&A, summaries) → Ollama (fast, free, private)
 *  - COMPLEX queries (full intelligence, cross-service analysis, risk radar) → Gemini (more capable)
 *  - Callers can also explicitly request a model via the "model" query param
 */
@Component
public class ModelRouter {

    private final ChatClient ollamaClient;
    private final ChatClient geminiClient;
    private final boolean geminiAvailable;

    public ModelRouter(
            @Qualifier("ollamaChatClient") ChatClient.Builder ollamaBuilder,
            @Qualifier("googleGenAiChatClient") ChatClient.Builder geminiBuilder,
            Environment env) {
        this.ollamaClient = ollamaBuilder.build();


        String apiKey = env.getProperty("spring.ai.google.genai.api-key", "not-set");
        if (!"not-set".equals(apiKey)) {
            this.geminiClient = geminiBuilder.build();
            this.geminiAvailable = true;
        } else {
            this.geminiClient = ollamaBuilder.build(); // fallback to Ollama
            this.geminiAvailable = false;
        }
    }

    public enum Complexity { SIMPLE, COMPLEX }

    /**
     * Get the right client based on complexity and explicit override.
     * @param requested  explicit model override: "ollama", "gemini", or null (auto)
     * @param complexity hint from the calling service
     */
    public ChatClient route(String requested, Complexity complexity) {
        if ("ollama".equalsIgnoreCase(requested)) return ollamaClient;
        if ("gemini".equalsIgnoreCase(requested)) return geminiAvailable ? geminiClient : ollamaClient;

        // Auto-routing: use Gemini for complex analysis if available
        //if (complexity == Complexity.COMPLEX && geminiAvailable) return geminiClient;
        return ollamaClient;
    }

    public String resolvedModelName(String requested, Complexity complexity) {
        if ("ollama".equalsIgnoreCase(requested)) return "ollama";
        if ("gemini".equalsIgnoreCase(requested)) return geminiAvailable ? "gemini-2.0-flash" : "ollama (gemini unavailable)";
        if (complexity == Complexity.COMPLEX && geminiAvailable) return "gemini-2.0-flash";
        return "ollama";
    }

}
