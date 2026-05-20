package com.meetup.contextservice.listener;

import com.meetup.contextservice.event.MeetupEvents;
import com.meetup.contextservice.model.MeetingContext;
import com.meetup.contextservice.model.MeetingStatus;
import com.meetup.contextservice.repository.MeetingContextRepository;
import com.meetup.contextservice.service.TopicExtractionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitHandler;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
@RabbitListener(queues = "${app.rabbitmq.queues.context-ingestion}")
public class ContextIngestionListener {

    private final MeetingContextRepository contextRepository;
    private final TopicExtractionService topicExtractionService;

    @RabbitHandler
    public void handleMeetingStarted(MeetupEvents.MeetingStarted event) {
        log.info("Handling meeting.started for meeting: {}", event.getMeetingId());
        
        if (contextRepository.findByMeetingId(event.getMeetingId()).isPresent()) {
            log.warn("Meeting context already exists for meeting: {}. Ignoring duplicate start event.", event.getMeetingId());
            return;
        }

        MeetingContext context = MeetingContext.builder()
                .meetingId(event.getMeetingId())
                .participantIds(event.getParticipantIds())
                .tweenGroupIds(event.getTweenGroupIds() != null ? event.getTweenGroupIds() : new ArrayList<>())
                .status(MeetingStatus.LIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        contextRepository.save(context);
    }

    @RabbitHandler
    public void handleTranscriptChunk(MeetupEvents.TranscriptChunk event) {
        log.debug("Handling transcript.chunk for meeting: {}", event.getMeetingId());
        contextRepository.findByMeetingId(event.getMeetingId()).ifPresent(context -> {
            MeetingContext.TranscriptChunk chunk = MeetingContext.TranscriptChunk.builder()
                    .speakerId(event.getSpeakerId())
                    .text(event.getText())
                    .timestamp(event.getTimestamp())
                    .build();
            context.getTranscript().add(chunk);
            context.setUpdatedAt(LocalDateTime.now());
            contextRepository.save(context);
        });
    }

    @RabbitHandler
    public void handleTaskCreated(MeetupEvents.TaskCreated event) {
        log.info("Handling task.created for meeting: {}", event.getMeetingId());
        contextRepository.findByMeetingId(event.getMeetingId()).ifPresent(context -> {
            context.getTasksRef().add(event.getTaskId());
            context.setUpdatedAt(LocalDateTime.now());
            contextRepository.save(context);
        });
    }

    @RabbitHandler
    public void handleMeetingEnded(MeetupEvents.MeetingEnded event) {
        log.info("Handling meeting.ended for meeting: {}", event.getMeetingId());
        contextRepository.findByMeetingId(event.getMeetingId()).ifPresent(context -> {
            // Extract topics from transcript
            List<String> texts = context.getTranscript().stream()
                    .map(MeetingContext.TranscriptChunk::getText)
                    .collect(Collectors.toList());
            context.setTopics(topicExtractionService.extractTopics(texts));
            
            context.setStatus(MeetingStatus.COMPLETE);
            context.setUpdatedAt(LocalDateTime.now());
            contextRepository.save(context);
            log.info("Finalized context with topics for meeting: {}", event.getMeetingId());
        });
    }
}
