package com.meetup.meetingservice.controller;

import com.meetup.meetingservice.dto.*;
import com.meetup.meetingservice.service.MeetingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    @PostMapping
    public ResponseEntity<MeetingResponse> createMeeting(@RequestBody MeetingRequest request) {
        return new ResponseEntity<>(meetingService.createMeeting(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<MeetingResponse>> getAllMeetings() {
        return ResponseEntity.ok(meetingService.getAllMeetings());
    }

    @GetMapping("/{meetingId}")
    public ResponseEntity<MeetingResponse> getMeeting(@PathVariable String meetingId) {
        return ResponseEntity.ok(meetingService.getMeeting(meetingId));
    }

    @PatchMapping("/{meetingId}")
    public ResponseEntity<MeetingResponse> updateMeeting(@PathVariable String meetingId, @RequestBody MeetingRequest request) {
        return ResponseEntity.ok(meetingService.updateMeeting(meetingId, request));
    }

    @PostMapping("/{meetingId}/join")
    public ResponseEntity<JoinMeetingResponse> joinMeeting(@PathVariable String meetingId, @RequestBody JoinMeetingRequest request) {
        return ResponseEntity.ok(meetingService.joinMeeting(meetingId, request));
    }

    @GetMapping("/{meetingId}/chat-info")
    public ResponseEntity<ChatInfoResponse> getChatInfo(@PathVariable String meetingId) {
        return ResponseEntity.ok(meetingService.getChatInfo(meetingId));
    }
}
