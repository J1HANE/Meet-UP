package com.meetup.aiservice.provider;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meetup.aiservice.prompt.PromptBuilder;
import org.springframework.ai.vertexai.gemini.VertexAiGeminiChatModel;
import org.springframework.stereotype.Component;

/**
 * Gemini provider — used for demo and submission.
 * Gemini exposes an OpenAI-compatible endpoint, so Spring AI's OpenAiChatModel
 * works with no extra dependencies. Just point base-url at Google's endpoint.
 * Bean name "gemini" matches the registry key in application.yml.
 */
@Component("gemini")
public class GeminiProvider extends AbstractLlmProvider {

    private final OpenAiChatModel openAiChatModel;

    public GeminiProvider(OpenAiChatModel openAiChatModel,
                          PromptBuilder promptBuilder,
                          ObjectMapper objectMapper) {
        super(promptBuilder, objectMapper);
        this.openAiChatModel = openAiChatModel;
    }

    @Override
    protected ChatModel chatModel() {
        return openAiChatModel;
    }

    @Override
    public String name() {
        return "gemini";
    }
}

