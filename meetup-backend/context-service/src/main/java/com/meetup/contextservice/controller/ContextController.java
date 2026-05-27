package com.meetup.contextservice.controller;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.meetup.contextservice.dto.AggregatedSnapshot;
import com.meetup.contextservice.dto.CreateDecisionRequest;
import com.meetup.contextservice.dto.CreateMeetingContextRequest;
import com.meetup.contextservice.model.MeetingContext;
import com.meetup.contextservice.service.ContextService;
import lombok.RequiredArgsConstructor;
import com.meetup.contextservice.config.AuthenticatedUser;
import org.springframework.security.core.Authentication;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/context")
@RequiredArgsConstructor
public class ContextController {

    private final ContextService contextService;

    @PostMapping
    public ResponseEntity<MeetingContext> createMeetingContext(
            @RequestBody CreateMeetingContextRequest request,
            Authentication authentication) {
        // For testing without authentication, use empty tweenIds
        List<UUID> userTweenIds = new ArrayList<>();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser) {
            AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
            userTweenIds = user.getTweenIds();
        }
        return ResponseEntity.ok(contextService.createMeetingContext(request, userTweenIds));
    }

    @GetMapping("/{meetingId}")
    public ResponseEntity<MeetingContext> getMeetingContext(
            @PathVariable UUID meetingId,
            Authentication authentication) {
        List<UUID> userTweenIds = new ArrayList<>();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser) {
            AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
            userTweenIds = user.getTweenIds();
        }
        return ResponseEntity.ok(contextService.getMeetingContext(meetingId, userTweenIds));
    }

    @DeleteMapping("/{meetingId}")
    public ResponseEntity<Void> deleteMeetingContext(
            @PathVariable UUID meetingId,
            Authentication authentication) {
        List<UUID> userTweenIds = new ArrayList<>();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser) {
            AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
            userTweenIds = user.getTweenIds();
        }
        contextService.deleteMeetingContext(meetingId, userTweenIds);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/briefing")
    public ResponseEntity<MeetingContext> getBriefing(
            @RequestParam UUID meetingId,
            Authentication authentication) {
        List<UUID> userTweenIds = new ArrayList<>();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser) {
            AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
            userTweenIds = user.getTweenIds();
        }
        return ResponseEntity.ok(contextService.getBriefing(meetingId, userTweenIds));
    }

    @GetMapping("/decisions")
    public ResponseEntity<List<MeetingContext.Decision>> getDecisions(
            @RequestParam UUID groupId,
            Authentication authentication) {
        List<UUID> userTweenIds = new ArrayList<>();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser) {
            AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
            userTweenIds = user.getTweenIds();
        }
        return ResponseEntity.ok(contextService.getDecisions(groupId, userTweenIds));
    }

    @PatchMapping("/{meetingId}/summary")
    public ResponseEntity<Void> updateSummary(
            @PathVariable UUID meetingId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        List<UUID> userTweenIds = new ArrayList<>();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser) {
            AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
            userTweenIds = user.getTweenIds();
        }
        contextService.updateSummary(meetingId, body.get("summary"), userTweenIds);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{meetingId}/transcript")
    public ResponseEntity<MeetingContext> addTranscriptChunk(
            @PathVariable UUID meetingId,
            @RequestBody MeetingContext.TranscriptChunk chunk,
            Authentication authentication) {
        List<UUID> userTweenIds = new ArrayList<>();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser) {
            AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
            userTweenIds = user.getTweenIds();
        }
        return ResponseEntity.ok(contextService.addTranscriptChunk(meetingId, chunk, userTweenIds));
    }

    @PostMapping("/{meetingId}/decisions")
    public ResponseEntity<MeetingContext> addDecision(
            @PathVariable UUID meetingId,
            @RequestBody CreateDecisionRequest request,
            Authentication authentication) {
        List<UUID> userTweenIds = new ArrayList<>();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser) {
            AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
            userTweenIds = user.getTweenIds();
        }
        return ResponseEntity.ok(contextService.addDecision(meetingId, request, userTweenIds));
    }

    @PostMapping("/{meetingId}/tasks")
    public ResponseEntity<MeetingContext> addTaskReference(
            @PathVariable UUID meetingId,
            @RequestBody Map<String, UUID> body,
            Authentication authentication) {
        List<UUID> userTweenIds = new ArrayList<>();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser) {
            AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
            userTweenIds = user.getTweenIds();
        }
        return ResponseEntity.ok(contextService.addTaskReference(meetingId, body.get("taskId"), userTweenIds));
    }

    @PatchMapping("/{meetingId}/status")
    public ResponseEntity<MeetingContext> updateMeetingStatus(
            @PathVariable UUID meetingId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        List<UUID> userTweenIds = new ArrayList<>();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser) {
            AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
            userTweenIds = user.getTweenIds();
        }
        return ResponseEntity.ok(contextService.updateMeetingStatus(meetingId, body.get("status"), userTweenIds));
    }

    @GetMapping("/search")
    public ResponseEntity<List<MeetingContext>> searchContexts(
            @RequestParam String query,
            @RequestParam(required = false) UUID groupId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "10") int limit,
            @RequestParam(required = false, defaultValue = "0") int offset,
            Authentication authentication) {
        List<UUID> userTweenIds = new ArrayList<>();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser) {
            AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
            userTweenIds = user.getTweenIds();
        }
        return ResponseEntity.ok(contextService.searchContexts(query, groupId, status, limit, offset, userTweenIds));
    }

    @GetMapping("/{meetingId}/snapshot")
    public ResponseEntity<AggregatedSnapshot> getAggregatedSnapshot(@PathVariable String meetingId) {
        return ResponseEntity.ok(contextService.getAggregatedSnapshot(meetingId));
    }
}
