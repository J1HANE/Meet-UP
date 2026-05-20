package com.meetup.aiservice.prompt;

import com.meetup.aiservice.model.SnapshotResponse;
import org.springframework.stereotype.Component;

/**
 * Builds the structured prompt sent to the LLM.
 * Kept separate so prompt iteration doesn't touch provider code.
 */
@Component
public class PromptBuilder {

    private static final String SYSTEM_PROMPT = """
            You are a meeting assistant for MeetUp!, a collaboration platform.
            Your job is to analyse meeting data and produce a structured summary.
            
            You MUST respond with valid JSON only. No markdown, no explanation, no preamble.
            Follow the exact output schema provided.
            """;

    private static final String OUTPUT_SCHEMA = """
            {
              "narrative": "2-3 sentence summary of what the meeting covered",
              "decisions": [
                { "text": "decision text", "attributedSpeaker": "name or null", "confidence": "high|medium|low" }
              ],
              "suggestedTasks": [
                { "title": "task title", "description": "detail", "suggestedAssignee": "name or null", "priority": "high|medium|low" }
              ],
              "groupInsights": [
                { "groupId": "id", "groupName": "name", "observation": "one sentence" }
              ],
              "openQuestions": ["question 1", "question 2"]
            }
            """;

    public String buildSystemPrompt() {
        return SYSTEM_PROMPT;
    }

    public String buildUserPrompt(SnapshotResponse snapshot) {
        var sb = new StringBuilder();

        sb.append("## Meeting: ").append(snapshot.getMeetingTitle())
                .append(" (ID: ").append(snapshot.getMeetingId()).append(")\n\n");

        // Participants
        sb.append("## Participants\n");
        if (snapshot.getParticipants() != null) {
            snapshot.getParticipants().forEach(p ->
                    sb.append("- ").append(p.getName())
                            .append(" (").append(p.getRole()).append(")\n"));
        }
        sb.append("\n");

        // Transcript
        sb.append("## Transcript\n");
        if (snapshot.getTranscriptChunks() != null && !snapshot.getTranscriptChunks().isEmpty()) {
            snapshot.getTranscriptChunks().forEach(chunk ->
                    sb.append(chunk).append("\n"));
        } else {
            sb.append("No transcript available.\n");
        }
        sb.append("\n");

        // Active tasks
        sb.append("## Active Tasks\n");
        if (snapshot.getTasks() != null && !snapshot.getTasks().isEmpty()) {
            snapshot.getTasks().forEach(t ->
                    sb.append("- [").append(t.getStatus()).append("] ")
                            .append(t.getTitle())
                            .append(t.getAssigneeName() != null ? " → assigned to " + t.getAssigneeName() : "")
                            .append("\n"));
        } else {
            sb.append("No tasks.\n");
        }
        sb.append("\n");

        // Groups
        sb.append("## Groups\n");
        if (snapshot.getGroups() != null && !snapshot.getGroups().isEmpty()) {
            snapshot.getGroups().forEach(g -> {
                sb.append("- ").append(g.getName())
                        .append(" [").append(g.getState()).append("]");
                if (g.getMemberNames() != null && !g.getMemberNames().isEmpty()) {
                    sb.append(" — members: ")
                            .append(String.join(", ", g.getMemberNames()));
                }
                sb.append("\n");
            });
        } else {
            sb.append("No groups.\n");
        }
        sb.append("\n");

        // Topic tags
        if (snapshot.getTopicTags() != null && !snapshot.getTopicTags().isEmpty()) {
            sb.append("## Topics identified\n")
                    .append(String.join(", ", snapshot.getTopicTags()))
                    .append("\n\n");
        }

        // Existing decisions (so LLM doesn't duplicate them)
        if (snapshot.getExistingDecisions() != null && !snapshot.getExistingDecisions().isEmpty()) {
            sb.append("## Already logged decisions (do not repeat these)\n");
            snapshot.getExistingDecisions().forEach(d -> sb.append("- ").append(d).append("\n"));
            sb.append("\n");
        }

        sb.append("## Required output schema\n").append(OUTPUT_SCHEMA);

        return sb.toString();
    }
}
