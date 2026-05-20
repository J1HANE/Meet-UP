package com.meetup.aiservice.controller;

import com.meetup.aiservice.model.SummariseRequest;
import com.meetup.aiservice.model.SummaryResult;
import com.meetup.aiservice.service.AiPipelineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Two entry points into the AI pipeline:
 *   POST /ai/summarise       — on-demand (client or dashboard)
 *   POST /ai/events/meeting-ended — event-triggered (Meeting Service webhook)
 */
@Slf4j
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiPipelineService pipelineService;

    /**
     * On-demand summary — returns result synchronously.
     * Client waits for the LLM response (or gets it from cache instantly).
     */
    @PostMapping("/summarise")
    public ResponseEntity<SummaryResult> summarise(@RequestBody SummariseRequest request) {
        log.info("On-demand summarise request for meeting {}", request.getMeetingId());
        var result = pipelineService.summarise(request);
        return ResponseEntity.ok(result);
    }

    /**
     * Event-triggered — called by Meeting Service (or Kafka consumer adapter)
     * when a meeting ends. Returns 202 Accepted immediately; pipeline runs synchronously
     * but caller doesn't need to wait for the full result.
     *
     * For a production system you'd run this async (@Async or a Kafka consumer).
     * For this academic project, synchronous is fine.
     */
    @PostMapping("/events/meeting-ended")
    public ResponseEntity<Void> onMeetingEnded(@RequestBody MeetingEndedEvent event) {
        log.info("meeting.ended event received for meeting {}", event.meetingId());
        var request = new SummariseRequest();
        request.setMeetingId(event.meetingId());
        pipelineService.summarise(request);
        return ResponseEntity.accepted().build();
    }

    /** Minimal event payload — extend with whatever Meeting Service publishes */
    public record MeetingEndedEvent(String meetingId, String meetingTitle) {}
}