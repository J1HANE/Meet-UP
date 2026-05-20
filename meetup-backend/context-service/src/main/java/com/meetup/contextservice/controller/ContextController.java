package com.meetup.contextservice.controller;

import com.meetup.contextservice.model.MeetingContext;
import com.meetup.contextservice.service.ContextService;
import lombok.RequiredArgsConstructor;
import com.meetup.contextservice.config.AuthenticatedUser;
import org.springframework.security.core.Authentication;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/context")
@RequiredArgsConstructor
public class ContextController {

    private final ContextService contextService;

    @GetMapping("/briefing")
    public ResponseEntity<MeetingContext> getBriefing(
            @RequestParam UUID meetingId,
            Authentication authentication) {
        AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
        return ResponseEntity.ok(contextService.getBriefing(meetingId, user.getTweenIds()));
    }

    @GetMapping("/decisions")
    public ResponseEntity<List<MeetingContext.Decision>> getDecisions(
            @RequestParam UUID groupId,
            Authentication authentication) {
        AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
        return ResponseEntity.ok(contextService.getDecisions(groupId, user.getTweenIds()));
    }

    @PatchMapping("/{meetingId}/summary")
    public ResponseEntity<Void> updateSummary(
            @PathVariable UUID meetingId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        AuthenticatedUser user = (AuthenticatedUser) authentication.getPrincipal();
        contextService.updateSummary(meetingId, body.get("summary"), user.getTweenIds());
        return ResponseEntity.noContent().build();
    }
}
