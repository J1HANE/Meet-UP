package com.meetup.contextservice.controller;

import com.meetup.contextservice.model.MeetingContext;
import com.meetup.contextservice.service.ContextService;
import lombok.RequiredArgsConstructor;
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
    public ResponseEntity<MeetingContext> getBriefing(@RequestParam UUID meetingId) {
        return ResponseEntity.ok(contextService.getBriefing(meetingId));
    }

    @GetMapping("/decisions")
    public ResponseEntity<List<MeetingContext.Decision>> getDecisions(@RequestParam UUID groupId) {
        return ResponseEntity.ok(contextService.getDecisions(groupId));
    }

    @PatchMapping("/{meetingId}/summary")
    public ResponseEntity<Void> updateSummary(
            @PathVariable UUID meetingId,
            @RequestBody Map<String, String> body) {
        contextService.updateSummary(meetingId, body.get("summary"));
        return ResponseEntity.noContent().build();
    }
}
