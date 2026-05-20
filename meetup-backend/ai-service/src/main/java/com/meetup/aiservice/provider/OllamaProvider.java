package com.meetup.aiservice.provider;


import com.meetup.aiservice.prompt.PromptBuilder;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

@Component("ollama")
public class OllamaProvider extends AbstractLlmProvider {

    private final OllamaChatModel ollamaChatModel;

    public OllamaProvider(OllamaChatModel ollamaChatModel,
                          PromptBuilder promptBuilder,
                          ObjectMapper objectMapper) {
        super(promptBuilder, objectMapper);
        this.ollamaChatModel = ollamaChatModel;
    }

    @Override
    protected ChatModel chatModel() {
        return ollamaChatModel;
    }

    @Override
    public String name() {
        return "ollama";
    }
}
