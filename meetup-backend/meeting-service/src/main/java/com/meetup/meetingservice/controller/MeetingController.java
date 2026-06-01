package com.meetup.meetingservice.controller;

import com.meetup.meetingservice.dto.AddParticipantRequest;
import com.meetup.meetingservice.dto.ChatInfoResponse;
import com.meetup.meetingservice.dto.ChatMessageResponse;
import com.meetup.meetingservice.dto.CreateMeetingRequest;
import com.meetup.meetingservice.dto.JoinMeetingRequest;
import com.meetup.meetingservice.dto.JoinMeetingResponse;
import com.meetup.meetingservice.dto.MeetingResponse;
import com.meetup.meetingservice.dto.ParticipantResponse;
import com.meetup.meetingservice.dto.PostChatMessageRequest;
import com.meetup.meetingservice.dto.RemoveParticipantRequest;
import com.meetup.meetingservice.dto.UpdateMeetingRequest;
import com.meetup.meetingservice.service.MeetingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    @PostMapping
    public ResponseEntity<MeetingResponse> createMeeting(@Valid @RequestBody CreateMeetingRequest request) {
        MeetingResponse response = meetingService.createMeeting(request);
        return ResponseEntity.created(URI.create("/api/meetings/" + response.id())).body(response);
    }

    @GetMapping
    public ResponseEntity<List<MeetingResponse>> getMeetings() {
        return ResponseEntity.ok(meetingService.getMeetings());
    }

    @GetMapping("/{meetingId}")
    public ResponseEntity<MeetingResponse> getMeeting(@PathVariable UUID meetingId) {
        return ResponseEntity.ok(meetingService.getMeeting(meetingId));
    }

    @PatchMapping("/{meetingId}")
    public ResponseEntity<MeetingResponse> updateMeeting(
            @PathVariable UUID meetingId,
            @RequestBody UpdateMeetingRequest request
    ) {
        return ResponseEntity.ok(meetingService.updateMeeting(meetingId, request));
    }

    @PostMapping("/{meetingId}/join")
    public ResponseEntity<JoinMeetingResponse> joinMeeting(
            @PathVariable UUID meetingId,
            @Valid @RequestBody JoinMeetingRequest request
    ) {
        return ResponseEntity.ok(meetingService.joinMeeting(meetingId, request));
    }

    @GetMapping("/{meetingId}/chat-info")
    public ResponseEntity<ChatInfoResponse> getChatInfo(@PathVariable UUID meetingId) {
        return ResponseEntity.ok(meetingService.getChatInfo(meetingId));
    }

    @GetMapping("/{meetingId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(@PathVariable UUID meetingId) {
        return ResponseEntity.ok(meetingService.listMessages(meetingId));
    }

    @PostMapping("/{meetingId}/messages")
    public ResponseEntity<ChatMessageResponse> postMessage(
            @PathVariable UUID meetingId,
            @Valid @RequestBody PostChatMessageRequest request
    ) {
        return ResponseEntity.ok(meetingService.postMessage(meetingId, request));
    }

    @PostMapping("/{meetingId}/participants")
    public ResponseEntity<ParticipantResponse> addParticipant(
            @PathVariable UUID meetingId,
            @Valid @RequestBody AddParticipantRequest request
    ) {
        return ResponseEntity.ok(meetingService.addParticipant(meetingId, request));
    }

    @DeleteMapping("/{meetingId}/participants")
    public ResponseEntity<Void> removeParticipant(
            @PathVariable UUID meetingId,
            @Valid @RequestBody RemoveParticipantRequest request
    ) {
        meetingService.removeParticipant(meetingId, request);
        return ResponseEntity.noContent().build();
    }
}
