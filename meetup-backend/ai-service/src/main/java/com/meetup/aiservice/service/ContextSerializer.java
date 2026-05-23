package com.meetup.aiservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meetup.aiservice.model.MeetingContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;


import java.util.List;
import java.util.Map;

/**
 * Converts MeetingContext into a structured text block for the AI prompt.
 * We don't dump raw JSON at the model — we format it so the model
 * can parse it more reliably, especially for smaller local models.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ContextSerializer {

    private final ObjectMapper objectMapper;

    public String serialize(MeetingContext ctx) {
        StringBuilder sb = new StringBuilder();

        if (ctx.getMeeting() != null) {
            sb.append("=== MEETING ===\n");
            appendJson(sb, ctx.getMeeting());
        }

        if (ctx.getParticipants() != null && !ctx.getParticipants().isEmpty()) {
            sb.append("\n=== PARTICIPANTS (").append(ctx.getParticipants().size()).append(") ===\n");
            appendList(sb, ctx.getParticipants());
        }

        if (ctx.getTasks() != null && !ctx.getTasks().isEmpty()) {
            sb.append("\n=== TASKS (").append(ctx.getTasks().size()).append(") ===\n");
            // Summarise key task stats before the full dump — helps the model
            appendTaskStats(sb, ctx.getTasks());
            appendList(sb, ctx.getTasks());
        }

        if (ctx.getGroups() != null && !ctx.getGroups().isEmpty()) {
            sb.append("\n=== GROUPS (").append(ctx.getGroups().size()).append(") ===\n");
            appendList(sb, ctx.getGroups());
        }

        return sb.toString();
    }

    /** Serialize only tasks — for task-specific endpoints */
    public String serializeTasks(List<Map<String, Object>> tasks) {
        StringBuilder sb = new StringBuilder();
        sb.append("=== TASKS (").append(tasks.size()).append(") ===\n");
        appendTaskStats(sb, tasks);
        appendList(sb, tasks);
        return sb.toString();
    }

    private void appendTaskStats(StringBuilder sb, List<Map<String, Object>> tasks) {
        long overdue = tasks.stream().filter(t -> Boolean.TRUE.equals(t.get("overdue"))).count();
        long blocked = tasks.stream().filter(t -> Boolean.TRUE.equals(t.get("blocked"))).count();
        long inBacklog = tasks.stream().filter(t -> "IN_BACKLOG".equals(t.get("status"))).count();
        long inProgress = tasks.stream().filter(t -> "IN_PROGRESS".equals(t.get("status"))).count();
        long completed = tasks.stream().filter(t -> "COMPLETED".equals(t.get("status"))).count();
        long highPriority = tasks.stream().filter(t -> "HIGH".equals(t.get("priority"))).count();
        long unassigned = tasks.stream().filter(t -> t.get("assignedTo") == null).count();

        sb.append(String.format(
                "Quick stats: total=%d, overdue=%d, blocked=%d, backlog=%d, inProgress=%d, completed=%d, highPriority=%d, unassigned=%d\n\n",
                tasks.size(), overdue, blocked, inBacklog, inProgress, completed, highPriority, unassigned));
    }

    private void appendJson(StringBuilder sb, Object obj) {
        try {
            sb.append(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(obj)).append("\n");
        } catch (Exception e) {
            sb.append(obj.toString()).append("\n");
        }
    }

    private void appendList(StringBuilder sb, List<?> list) {
        try {
            sb.append(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(list)).append("\n");
        } catch (Exception e) {
            sb.append(list.toString()).append("\n");
        }
    }
}
