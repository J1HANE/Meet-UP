package com.meetup.contextservice.controller;

import com.meetup.contextservice.config.AuthenticatedUser;
import com.meetup.contextservice.dto.CreateDecisionRequest;
import com.meetup.contextservice.dto.CreateMeetingContextRequest;
import com.meetup.contextservice.model.MeetingContext;
import com.meetup.contextservice.model.MeetingStatus;
import com.meetup.contextservice.service.ContextService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContextControllerTest {

    @Mock
    private ContextService contextService;

    @InjectMocks
    private ContextController contextController;

    private MeetingContext meetingContext;
    private AuthenticatedUser authenticatedUser;

    @BeforeEach
    void setUp() {
        UUID meetingId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID tweenId = UUID.randomUUID();

        meetingContext = MeetingContext.builder()
                .id(UUID.randomUUID().toString())
                .meetingId(meetingId)
                .participantIds(List.of(userId))
                .tweenGroupIds(List.of(tweenId))
                .transcript(List.of())
                .decisions(List.of())
                .tasksRef(List.of())
                .topics(List.of("AI", "Machine Learning"))
                .summary("Test summary")
                .status(MeetingStatus.LIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        authenticatedUser = new AuthenticatedUser(
                userId,
                "test@example.com",
                List.of(new SimpleGrantedAuthority("ROLE_member")),
                List.of(tweenId)
        );

        UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(authenticatedUser, null, authenticatedUser.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }

    @Test
    void testCreateMeetingContext_Success() {
        CreateMeetingContextRequest request = CreateMeetingContextRequest.builder()
                .meetingId(UUID.randomUUID())
                .participantIds(List.of(UUID.randomUUID()))
                .tweenGroupIds(List.of(UUID.randomUUID()))
                .status("LIVE")
                .build();

        when(contextService.createMeetingContext(any(CreateMeetingContextRequest.class), anyList()))
                .thenReturn(meetingContext);

        ResponseEntity<MeetingContext> response = contextController.createMeetingContext(request, 
                SecurityContextHolder.getContext().getAuthentication());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody().getMeetingId());
        assertEquals(MeetingStatus.LIVE, response.getBody().getStatus());
        verify(contextService).createMeetingContext(any(CreateMeetingContextRequest.class), anyList());
    }

    @Test
    void testGetMeetingContext_Success() {
        UUID meetingId = UUID.randomUUID();

        when(contextService.getMeetingContext(any(UUID.class), anyList())).thenReturn(meetingContext);

        ResponseEntity<MeetingContext> response = contextController.getMeetingContext(meetingId,
                SecurityContextHolder.getContext().getAuthentication());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody().getMeetingId());
        assertEquals(MeetingStatus.LIVE, response.getBody().getStatus());
        verify(contextService).getMeetingContext(eq(meetingId), anyList());
    }

    @Test
    void testDeleteMeetingContext_Success() {
        UUID meetingId = UUID.randomUUID();

        ResponseEntity<Void> response = contextController.deleteMeetingContext(meetingId,
                SecurityContextHolder.getContext().getAuthentication());

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(contextService).deleteMeetingContext(eq(meetingId), anyList());
    }

    @Test
    void testGetBriefing_Success() {
        UUID meetingId = UUID.randomUUID();

        when(contextService.getBriefing(any(UUID.class), anyList())).thenReturn(meetingContext);

        ResponseEntity<MeetingContext> response = contextController.getBriefing(meetingId,
                SecurityContextHolder.getContext().getAuthentication());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody().getMeetingId());
        assertEquals("Test summary", response.getBody().getSummary());
        verify(contextService).getBriefing(eq(meetingId), anyList());
    }

    @Test
    void testGetDecisions_Success() {
        UUID groupId = UUID.randomUUID();
        MeetingContext.Decision decision = MeetingContext.Decision.builder()
                .text("We will proceed with microservices")
                .attributedSpeakerId("user123")
                .meetingId(UUID.randomUUID())
                .timestamp(LocalDateTime.now())
                .build();

        when(contextService.getDecisions(any(UUID.class), anyList())).thenReturn(List.of(decision));

        ResponseEntity<List<MeetingContext.Decision>> response = contextController.getDecisions(groupId,
                SecurityContextHolder.getContext().getAuthentication());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("We will proceed with microservices", response.getBody().get(0).getText());
        verify(contextService).getDecisions(eq(groupId), anyList());
    }

    @Test
    void testUpdateSummary_Success() {
        UUID meetingId = UUID.randomUUID();
        Map<String, String> body = Map.of("summary", "Updated summary");

        ResponseEntity<Void> response = contextController.updateSummary(meetingId, body,
                SecurityContextHolder.getContext().getAuthentication());

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(contextService).updateSummary(eq(meetingId), eq("Updated summary"), anyList());
    }

    @Test
    void testAddTranscriptChunk_Success() {
        UUID meetingId = UUID.randomUUID();
        MeetingContext.TranscriptChunk chunk = MeetingContext.TranscriptChunk.builder()
                .speakerId("user123")
                .text("I think we should implement this feature")
                .timestamp(LocalDateTime.now())
                .build();

        when(contextService.addTranscriptChunk(any(UUID.class), any(MeetingContext.TranscriptChunk.class), anyList()))
                .thenReturn(meetingContext);

        ResponseEntity<MeetingContext> response = contextController.addTranscriptChunk(meetingId, chunk,
                SecurityContextHolder.getContext().getAuthentication());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody().getMeetingId());
        verify(contextService).addTranscriptChunk(eq(meetingId), eq(chunk), anyList());
    }

    @Test
    void testAddDecision_Success() {
        UUID meetingId = UUID.randomUUID();
        CreateDecisionRequest request = CreateDecisionRequest.builder()
                .text("We will proceed with microservices architecture")
                .attributedSpeakerId("user123")
                .build();

        when(contextService.addDecision(any(UUID.class), any(CreateDecisionRequest.class), anyList()))
                .thenReturn(meetingContext);

        ResponseEntity<MeetingContext> response = contextController.addDecision(meetingId, request,
                SecurityContextHolder.getContext().getAuthentication());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody().getMeetingId());
        verify(contextService).addDecision(eq(meetingId), eq(request), anyList());
    }

    @Test
    void testAddTaskReference_Success() {
        UUID meetingId = UUID.randomUUID();
        UUID taskId = UUID.randomUUID();
        Map<String, UUID> body = Map.of("taskId", taskId);

        when(contextService.addTaskReference(any(UUID.class), any(UUID.class), anyList()))
                .thenReturn(meetingContext);

        ResponseEntity<MeetingContext> response = contextController.addTaskReference(meetingId, body,
                SecurityContextHolder.getContext().getAuthentication());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody().getMeetingId());
        verify(contextService).addTaskReference(eq(meetingId), eq(taskId), anyList());
    }

    @Test
    void testUpdateMeetingStatus_Success() {
        UUID meetingId = UUID.randomUUID();
        Map<String, String> body = Map.of("status", "COMPLETED");

        when(contextService.updateMeetingStatus(any(UUID.class), anyString(), anyList()))
                .thenReturn(meetingContext);

        ResponseEntity<MeetingContext> response = contextController.updateMeetingStatus(meetingId, body,
                SecurityContextHolder.getContext().getAuthentication());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(MeetingStatus.LIVE, response.getBody().getStatus());
        verify(contextService).updateMeetingStatus(eq(meetingId), eq("COMPLETED"), anyList());
    }

    @Test
    void testSearchContexts_Success() {
        when(contextService.searchContexts(anyString(), any(), any(), anyInt(), anyInt(), anyList()))
                .thenReturn(List.of(meetingContext));

        ResponseEntity<List<MeetingContext>> response = contextController.searchContexts("AI meeting", null, null, 10, 0,
                SecurityContextHolder.getContext().getAuthentication());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertNotNull(response.getBody().get(0).getMeetingId());
        verify(contextService).searchContexts(eq("AI meeting"), isNull(), isNull(), eq(10), eq(0), anyList());
    }

    @Test
    void testSearchContexts_WithFilters_Success() {
        UUID groupId = UUID.randomUUID();

        when(contextService.searchContexts(anyString(), any(), any(), anyInt(), anyInt(), anyList()))
                .thenReturn(List.of(meetingContext));

        ResponseEntity<List<MeetingContext>> response = contextController.searchContexts("AI meeting", groupId, "COMPLETED", 10, 0,
                SecurityContextHolder.getContext().getAuthentication());

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        verify(contextService).searchContexts(eq("AI meeting"), eq(groupId), eq("COMPLETED"), eq(10), eq(0), anyList());
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }
}
