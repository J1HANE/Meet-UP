package com.meetup.aiservice;

import com.meetup.aiservice.model.InsightResponse;
import com.meetup.aiservice.model.MeetingContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class MeetingIntelligenceTest {

    @LocalServerPort
    int port;
    @Autowired
    TestRestTemplate rest;
    @Autowired
    ObjectMapper objectMapper;

    private String base;
    private MeetingContext fullContext;
    private List<Map<String, Object>> sampleTasks;

    @BeforeEach
    void setup() {
        base = "http://localhost:" + port + "/api/v1/insights";

        // Sample tasks matching the real data shape from your task service
        sampleTasks = List.of(
                Map.of(
                        "taskId", "f20f93c9-96dd-4ca2-bf10-90eac3b30e69",
                        "taskName", "Test 123",
                        "taskDescription", "Build payment service",
                        "priority", "HIGH",
                        "status", "IN_BACKLOG",
                        "overdue", true,
                        "blocked", false,
                        "blockingCount", 2,
                        "progressPercent", 0,
                        "estimatedHours", 24.5,
                        "ageInDays", 19,
                        "assignedTo", null
                ),
                Map.of(
                        "taskId", "4ff6fcfd-70e6-47ab-93d4-64e3b92c96aa",
                        "taskName", "Implement authentication service",
                        "taskDescription", "Build JWT-based authentication with refresh tokens",
                        "priority", "LOW",
                        "status", "IN_BACKLOG",
                        "overdue", true,
                        "blocked", false,
                        "blockingCount", 0,
                        "progressPercent", 0,
                        "estimatedHours", 24.5,
                        "ageInDays", 19,
                        "assignedTo", null
                ),
                Map.of(
                        "taskId", "3d31c693-62f8-4e7b-b46b-61b49df10956",
                        "taskName", "Task Full 2",
                        "taskDescription", "Test Full",
                        "priority", "HIGH",
                        "status", "COMPLETED",
                        "overdue", false,
                        "blocked", true,
                        "progressPercent", 23,
                        "estimatedHours", 25,
                        "actualHours", 25,
                        "ageInDays", 19,
                        "assignedTo", "user-1"
                )
        );

        // Sample participants from user service
        List<Map<String, Object>> participants = List.of(
                Map.of("userId", "user-1", "name", "Alice Smith", "role", "DEVELOPER", "email", "alice@example.com"),
                Map.of("userId", "user-2", "name", "Bob Johnson", "role", "TECH_LEAD", "email", "bob@example.com"),
                Map.of("userId", "reviewer-1", "name", "Carol White", "role", "QA_ENGINEER", "email", "carol@example.com")
        );

        // Sample groups from group management service
        List<Map<String, Object>> groups = List.of(
                Map.of("groupId", "team-a", "name", "Backend Team",
                        "members", List.of("user-1", "user-2"),
                        "taskCount", 5)
        );

        // Sample meeting from meeting service
        MeetingContext.MeetingData meeting = new MeetingContext.MeetingData();
        meeting.setMeetingId("meeting-001");
        meeting.setTitle("Sprint Planning - Week 21");
        meeting.setStatus("IN_PROGRESS");
        meeting.setOrganizer("user-2");
        meeting.setAttendeeIds(List.of("user-1", "user-2", "reviewer-1"));
        meeting.setNotes("Discussing overdue tasks and payment service status");
        meeting.setAgenda(List.of(
                Map.of("item", "Review overdue tasks", "duration", "15 min"),
                Map.of("item", "Payment service status", "duration", "20 min"),
                Map.of("item", "Sprint goals", "duration", "10 min")
        ));

        fullContext = new MeetingContext();
        fullContext.setMeeting(meeting);
        fullContext.setTasks(sampleTasks);
        fullContext.setParticipants(participants);
        fullContext.setGroups(groups);
    }

    HttpHeaders jsonHeaders() {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        return h;
    }

    // ─────────────────────────────────────────────
    // Health check
    // ─────────────────────────────────────────────
    @Test
    void healthCheckShouldReturnUp() {
        ResponseEntity<Map> response = rest.getForEntity(base + "/health", Map.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("status", "UP");
        System.out.println("✅ Health: " + response.getBody());
    }

    // ─────────────────────────────────────────────
    // Task analysis
    // ─────────────────────────────────────────────
    @Test
    void taskAnalysisShouldReturnInsights() throws Exception {
        HttpEntity<String> req = new HttpEntity<>(
                objectMapper.writeValueAsString(sampleTasks), jsonHeaders());

        ResponseEntity<InsightResponse> resp = rest.postForEntity(
                base + "/tasks", req, InsightResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        InsightResponse body = resp.getBody();
        assertThat(body).isNotNull();
        assertThat(body.getSummary()).isNotBlank();
        assertThat(body.getInsightType()).isEqualTo("TASK_ANALYSIS");

        System.out.println("✅ Task Analysis Summary:\n" + body.getSummary());
        System.out.println("   Insights count: " + body.getInsights().size());
        body.getInsights().forEach(i ->
                System.out.println("   [" + i.getSeverity() + "] " + i.getTitle()));
    }

    // ─────────────────────────────────────────────
    // Relationship analysis
    // ─────────────────────────────────────────────
    @Test
    void relationshipAnalysisShouldReturnInsights() throws Exception {
        HttpEntity<String> req = new HttpEntity<>(
                objectMapper.writeValueAsString(fullContext), jsonHeaders());

        ResponseEntity<InsightResponse> resp = rest.postForEntity(
                base + "/relationships", req, InsightResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody().getSummary()).isNotBlank();

        System.out.println("✅ Relationship Summary:\n" + resp.getBody().getSummary());
    }

    // ─────────────────────────────────────────────
    // Risk radar
    // ─────────────────────────────────────────────
    @Test
    void riskRadarShouldIdentifyRisks() throws Exception {
        HttpEntity<String> req = new HttpEntity<>(
                objectMapper.writeValueAsString(fullContext), jsonHeaders());

        ResponseEntity<InsightResponse> resp = rest.postForEntity(
                base + "/risk-radar", req, InsightResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        InsightResponse body = resp.getBody();
        assertThat(body.getSummary()).isNotBlank();

        System.out.println("✅ Risk Radar Summary:\n" + body.getSummary());
        body.getInsights().stream()
                .filter(i -> "HIGH".equals(i.getSeverity()))
                .forEach(i -> System.out.println("   🔴 HIGH: " + i.getTitle()));
    }

    // ─────────────────────────────────────────────
    // Action items
    // ─────────────────────────────────────────────
    @Test
    void actionItemsShouldGenerateOwners() throws Exception {
        HttpEntity<String> req = new HttpEntity<>(
                objectMapper.writeValueAsString(fullContext), jsonHeaders());

        ResponseEntity<InsightResponse> resp = rest.postForEntity(
                base + "/action-items", req, InsightResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        System.out.println("✅ Action Items:\n" + resp.getBody().getSummary());
        resp.getBody().getInsights()
                .forEach(i -> System.out.println("   → " + i.getTitle() +
                        " | Owner: " + i.getAffectedEntities()));
    }

    // ─────────────────────────────────────────────
    // Smart Q&A
    // ─────────────────────────────────────────────
    @Test
    void askQuestionShouldAnswer() throws Exception {
        HttpEntity<String> req = new HttpEntity<>(
                objectMapper.writeValueAsString(fullContext), jsonHeaders());

        String question = "Which tasks are most at risk and who should be assigned to fix them?";
        ResponseEntity<String> resp = rest.postForEntity(
                base + "/ask?question=" + question.replace(" ", "+"),
                req, String.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(resp.getBody()).isNotBlank();
        System.out.println("✅ Q&A Answer:\n" + resp.getBody());
    }

    // ─────────────────────────────────────────────
    // Full intelligence (flagship)
    // ─────────────────────────────────────────────
    @Test
    void fullIntelligenceShouldReturnComprehensiveReport() throws Exception {
        HttpEntity<String> req = new HttpEntity<>(
                objectMapper.writeValueAsString(fullContext), jsonHeaders());

        ResponseEntity<InsightResponse> resp = rest.postForEntity(
                base + "/full", req, InsightResponse.class);

        assertThat(resp.getStatusCode()).isEqualTo(HttpStatus.OK);
        InsightResponse body = resp.getBody();
        assertThat(body.getSummary()).isNotBlank();
        assertThat(body.getInsights()).isNotEmpty();
        assertThat(body.getInsightType()).isEqualTo("FULL_INTELLIGENCE");

        System.out.println("✅ Full Intelligence Report");
        System.out.println("   Model used: " + body.getModel());
        System.out.println("   Summary: " + body.getSummary());
        System.out.println("   Total insights: " + body.getInsights().size());
        System.out.println("\n   All insights:");
        body.getInsights().forEach(i ->
                System.out.println("   [" + i.getSeverity() + "][" + i.getCategory() + "] "
                        + i.getTitle() + "\n     → " + i.getRecommendation()));
    }
}
