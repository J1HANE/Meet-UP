package com.meetup.aiservice.service;

import com.meetup.aiservice.model.InsightResponse;
import com.meetup.aiservice.model.MeetingContext;
import com.meetup.aiservice.prompt.PromptLibrary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MeetingIntelligenceService {

    private final ModelRouter modelRouter;
    private final InsightParser insightParser;
    private final ContextSerializer contextSerializer;

    // ─────────────────────────────────────────────────────────
    // 1. TASK ANALYSIS
    // ─────────────────────────────────────────────────────────
    /**
     * Analyses tasks from the task management service.
     * Surfaces overdue, blocked, unassigned, and at-risk tasks.
     */
    public InsightResponse analyseTasks(List<Map<String, Object>> tasks, String model) {
        log.info("Analysing {} tasks", tasks.size());
        ChatClient client = modelRouter.route(model, ModelRouter.Complexity.SIMPLE);
        String resolvedModel = modelRouter.resolvedModelName(model, ModelRouter.Complexity.SIMPLE);

        String context = contextSerializer.serializeTasks(tasks);
        String raw = callAi(client, PromptLibrary.TASK_ANALYSIS_SYSTEM,
                "Analyse these tasks and provide insights:\n\n" + context);

        return insightParser.parse(raw, "TASK_ANALYSIS", resolvedModel);
    }

    // ─────────────────────────────────────────────────────────
    // 2. RELATIONSHIP ANALYSIS
    // ─────────────────────────────────────────────────────────
    /**
     * Analyses relationships between participants, their group memberships,
     * and how they relate to the tasks being discussed.
     */
    public InsightResponse analyseRelationships(MeetingContext ctx, String model) {
        log.info("Analysing relationships for meeting: {}",
                ctx.getMeeting() != null ? ctx.getMeeting().getMeetingId() : "unknown");
        ChatClient client = modelRouter.route(model, ModelRouter.Complexity.COMPLEX);
        String resolvedModel = modelRouter.resolvedModelName(model, ModelRouter.Complexity.COMPLEX);

        String context = contextSerializer.serialize(ctx);
        String raw = callAi(client, PromptLibrary.RELATIONSHIP_ANALYSIS_SYSTEM,
                "Analyse team relationships and collaboration patterns:\n\n" + context);

        return insightParser.parse(raw, "RELATIONSHIP_ANALYSIS", resolvedModel);
    }

    // ─────────────────────────────────────────────────────────
    // 3. MEETING EFFECTIVENESS
    // ─────────────────────────────────────────────────────────
    /**
     * Evaluates whether this meeting is effective — right people, right agenda,
     * action items with owners, connection to actual tasks.
     */
    public InsightResponse analyseMeetingEffectiveness(MeetingContext ctx, String model) {
        log.info("Analysing meeting effectiveness");
        ChatClient client = modelRouter.route(model, ModelRouter.Complexity.SIMPLE);
        String resolvedModel = modelRouter.resolvedModelName(model, ModelRouter.Complexity.SIMPLE);

        String context = contextSerializer.serialize(ctx);
        String raw = callAi(client, PromptLibrary.MEETING_EFFECTIVENESS_SYSTEM,
                "Evaluate this meeting's effectiveness:\n\n" + context);

        return insightParser.parse(raw, "MEETING_EFFECTIVENESS", resolvedModel);
    }

    // ─────────────────────────────────────────────────────────
    // 4. FULL INTELLIGENCE (everything at once)
    // ─────────────────────────────────────────────────────────
    /**
     * The flagship endpoint — sends all 4 services' data and asks for
     * a comprehensive intelligence report covering everything.
     * Auto-routes to Gemini for best quality.
     */
    public InsightResponse fullIntelligence(MeetingContext ctx, String model) {
        log.info("Running full intelligence analysis");
        // Full intelligence always prefers Gemini (complex)
        ChatClient client = modelRouter.route(model, ModelRouter.Complexity.COMPLEX);
        String resolvedModel = modelRouter.resolvedModelName(model, ModelRouter.Complexity.COMPLEX);

        String context = contextSerializer.serialize(ctx);
        String raw = callAi(client, PromptLibrary.FULL_INTELLIGENCE_SYSTEM,
                "Provide a full intelligence report for this team and meeting:\n\n" + context);

        return insightParser.parse(raw, "FULL_INTELLIGENCE", resolvedModel);
    }

    // ─────────────────────────────────────────────────────────
    // 5. RISK RADAR
    // ─────────────────────────────────────────────────────────
    /**
     * Focused purely on risks — dependency chains, single points of failure,
     * overdue milestones, unassigned critical tasks.
     */
    public InsightResponse riskRadar(MeetingContext ctx, String model) {
        log.info("Running risk radar");
        ChatClient client = modelRouter.route(model, ModelRouter.Complexity.COMPLEX);
        String resolvedModel = modelRouter.resolvedModelName(model, ModelRouter.Complexity.COMPLEX);

        String context = contextSerializer.serialize(ctx);
        String raw = callAi(client, PromptLibrary.RISK_RADAR_SYSTEM,
                "Identify all risks in this team's current state:\n\n" + context);

        return insightParser.parse(raw, "RISK_RADAR", resolvedModel);
    }

    // ─────────────────────────────────────────────────────────
    // 6. ACTION ITEMS GENERATOR
    // ─────────────────────────────────────────────────────────
    /**
     * Generates a specific list of action items that should come out of this meeting,
     * with owners, urgency, and suggested deadlines.
     */
    public InsightResponse generateActionItems(MeetingContext ctx, String model) {
        log.info("Generating action items");
        ChatClient client = modelRouter.route(model, ModelRouter.Complexity.SIMPLE);
        String resolvedModel = modelRouter.resolvedModelName(model, ModelRouter.Complexity.SIMPLE);

        String context = contextSerializer.serialize(ctx);
        String raw = callAi(client, PromptLibrary.ACTION_ITEMS_SYSTEM,
                "Generate action items for this meeting:\n\n" + context);

        return insightParser.parse(raw, "ACTION_ITEMS", resolvedModel);
    }

    // ─────────────────────────────────────────────────────────
    // 7. SMART Q&A
    // ─────────────────────────────────────────────────────────
    /**
     * Ask any natural language question about the meeting/tasks/team.
     * Returns plain text — not structured JSON.
     * e.g. "Who is responsible for the payment service?"
     *      "Which tasks are blocking the most progress?"
     *      "What should we focus on in today's meeting?"
     */
    public String askQuestion(MeetingContext ctx, String question, String model) {
        log.info("Answering question: {}", question);
        ChatClient client = modelRouter.route(model, ModelRouter.Complexity.SIMPLE);

        String context = contextSerializer.serialize(ctx);
        return callAi(client, PromptLibrary.QA_SYSTEM,
                "Context:\n\n" + context + "\n\nQuestion: " + question);
    }

    // ─────────────────────────────────────────────────────────
    // INTERNAL
    // ─────────────────────────────────────────────────────────
    private String callAi(ChatClient client, String systemPrompt, String userMessage) {
        return client.prompt()
                .system(systemPrompt)
                .user(userMessage)
                .call()
                .content();
    }
}
