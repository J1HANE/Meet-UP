package com.meetup.meetingservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
                "service", "meeting-service",
                "status", "UP",
                "message", "Meeting service is running",
                "availableEndpoints", new String[] {
                        "GET /api/meetings",
                        "POST /api/meetings",
                        "GET /api/meetings/{meetingId}",
                        "PATCH /api/meetings/{meetingId}",
                        "POST /api/meetings/{meetingId}/join",
                        "GET /api/meetings/{meetingId}/chat-info"
                }
        ));
    }
}
