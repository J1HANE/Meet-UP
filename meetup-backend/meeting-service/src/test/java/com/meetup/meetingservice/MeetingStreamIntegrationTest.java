package com.meetup.meetingservice;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MeetingStreamIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private Environment environment;

    @Test
    void createMeetingAndJoinReturnsRealStreamTokens() throws Exception {
        assertNotMockProfile();
        String meetingId = createMeetingAndReturnId();

        String userId = "user-" + UUID.randomUUID();
        String joinRequest = "{\"userId\":\"" + userId + "\"}";

        mockMvc.perform(post("/api/meetings/{meetingId}/join", meetingId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(joinRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.meetingId").value(meetingId))
                .andExpect(jsonPath("$.video.callType").value("default"))
                .andExpect(jsonPath("$.video.callId").value(meetingId))
                .andExpect(jsonPath("$.video.token").isNotEmpty())
                .andExpect(jsonPath("$.video.token", not(startsWith("mock-stream-token-"))))
                .andExpect(jsonPath("$.chat.apiKey").isNotEmpty())
                .andExpect(jsonPath("$.chat.channelType").value("messaging"))
                .andExpect(jsonPath("$.chat.channelId").value(meetingId))
                .andExpect(jsonPath("$.chat.userToken").isNotEmpty())
                .andExpect(jsonPath("$.chat.userToken", not(startsWith("mock-stream-token-"))));
    }

    @Test
    void chatInfoReturnsRealStreamChannelData() throws Exception {
        assertNotMockProfile();
        String meetingId = createMeetingAndReturnId();

        mockMvc.perform(get("/api/meetings/{meetingId}/chat-info", meetingId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.meetingId").value(meetingId))
                .andExpect(jsonPath("$.apiKey").isNotEmpty())
                .andExpect(jsonPath("$.channelType").value("messaging"))
                .andExpect(jsonPath("$.channelId", equalTo(meetingId)));
    }

    @Test
    void createMeetingReturnsIdAndAllowsStreamResourceResolution() throws Exception {
        assertNotMockProfile();
        String meetingId = createMeetingAndReturnId();

        mockMvc.perform(get("/api/meetings/{meetingId}/chat-info", meetingId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.channelId").value(meetingId));
    }

    private String createMeetingAndReturnId() throws Exception {
        String createRequest = """
                {
                  "title": "Stream Integration Test",
                  "description": "Verify real Stream connectivity",
                  "startTime": "%s"
                }
                """.formatted(LocalDateTime.now().plusMinutes(10));

        MvcResult result = mockMvc.perform(post("/api/meetings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createRequest))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        Matcher matcher = Pattern.compile("\"id\"\\s*:\\s*\"([^\"]+)\"").matcher(responseBody);
        if (!matcher.find()) {
            throw new AssertionError("Failed to extract meeting id from response: " + responseBody);
        }
        return matcher.group(1);
    }

    private void assertNotMockProfile() {
        if (Arrays.asList(environment.getActiveProfiles()).contains("mock")) {
            throw new AssertionError("Integration tests must run with non-mock profile.");
        }
    }
}
