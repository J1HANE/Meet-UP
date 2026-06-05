package com.meetup.meetingservice.event;

import com.meetup.meetingservice.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RabbitMQEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishMeetingStarted(MeetingStartedEvent event) {
        log.info("Publishing MeetingStartedEvent for meeting: {}", event.getMeetingId());
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.MEETING_EVENTS_EXCHANGE,
            RabbitMQConfig.MEETING_STARTED_ROUTING_KEY,
            event
        );
    }

    public void publishMeetingEnded(MeetingEndedEvent event) {
        log.info("Publishing MeetingEndedEvent for meeting: {}", event.getMeetingId());
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.MEETING_EVENTS_EXCHANGE,
            RabbitMQConfig.MEETING_ENDED_ROUTING_KEY,
            event
        );
    }

    public void publishParticipantAdded(ParticipantAddedEvent event) {
        log.info("Publishing ParticipantAddedEvent for meeting: {} to participant: {}", event.getMeetingId(), event.getParticipantEmail());
        rabbitTemplate.convertAndSend(
            RabbitMQConfig.MEETING_EVENTS_EXCHANGE,
            RabbitMQConfig.PARTICIPANT_ADDED_ROUTING_KEY,
            event
        );
    }
}
