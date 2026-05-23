package com.meetup.aiservice.service;





import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.meetup.aiservice.model.InsightResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;


import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Parses the raw AI text response (which should be JSON) into InsightResponse.
 * Handles dirty output gracefully — if the AI wraps it in backticks or adds
 * preamble text, we strip it before parsing.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InsightParser {

    private final ObjectMapper objectMapper;

    public InsightResponse parse(String rawAiResponse, String insightType, String model) {
        try {
            String cleaned = cleanJson(rawAiResponse);
            JsonNode root = objectMapper.readTree(cleaned);

            String summary = root.path("summary").asText("No summary available.");
            List<InsightResponse.Insight> insights = new ArrayList<>();

            JsonNode insightsNode = root.path("insights");
            if (insightsNode.isArray()) {
                for (JsonNode node : insightsNode) {
                    List<String> affected = new ArrayList<>();
                    node.path("affectedEntities").forEach(e -> affected.add(e.asText()));

                    insights.add(InsightResponse.Insight.builder()
                            .category(node.path("category").asText("GENERAL"))
                            .severity(node.path("severity").asText("INFO"))
                            .title(node.path("title").asText(""))
                            .detail(node.path("detail").asText(""))
                            .affectedEntities(affected)
                            .recommendation(node.path("recommendation").asText(""))
                            .build());
                }
            }

            return InsightResponse.builder()
                    .insightType(insightType)
                    .summary(summary)
                    .insights(insights)
                    .model(model)
                    .generatedAt(Instant.now().toString())
                    .build();

        } catch (Exception e) {
            log.warn("Failed to parse AI response as JSON, returning raw summary. Error: {}", e.getMessage());
            return InsightResponse.builder()
                    .insightType(insightType)
                    .summary(rawAiResponse)
                    .insights(List.of())
                    .model(model)
                    .generatedAt(Instant.now().toString())
                    .build();
        }
    }

    private String cleanJson(String raw) {
        if (raw == null) return "{}";
        // Strip markdown code fences the AI sometimes adds
        String cleaned = raw.trim()
                .replaceAll("^```json\\s*", "")
                .replaceAll("^```\\s*", "")
                .replaceAll("```$", "")
                .trim();

        // Find the first { in case there's preamble text before the JSON
        int firstBrace = cleaned.indexOf('{');
        if (firstBrace > 0) {
            cleaned = cleaned.substring(firstBrace);
        }
        return cleaned;
    }
}