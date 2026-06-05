package com.meetup.notificationservice.consumer;

import com.meetup.notificationservice.config.RabbitMQConfig;
import com.meetup.types.notifications.NotificationChannel;
import com.meetup.types.notifications.NotificationMessage;
import com.meetup.types.notifications.NotificationPriority;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class MeetingEventConsumer {

    private final RabbitTemplate rabbitTemplate;

    @RabbitListener(queues = RabbitMQConfig.MEETING_EVENTS_QUEUE)
    public void handleParticipantAdded(Map<String, Object> event) {
        try {
            log.info("Received participant added event: {}", event);
            handleParticipantAddedEvent(event);
        } catch (Exception e) {
            log.error("Failed to process meeting event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process participant added event", e);
        }
    }

    private void handleParticipantAddedEvent(Map<String, Object> eventData) {
        try {
            String meetingId = (String) eventData.get("meetingId");
            String meetingTitle = (String) eventData.get("meetingTitle");
            String participantEmail = (String) eventData.get("participantEmail");
            String participantName = (String) eventData.get("participantName");
            String hostName = (String) eventData.get("hostName");
            String meetingLink = (String) eventData.get("meetingLink");
            
            log.info("Processing participant added event for meeting: {}, participant: {}", meetingId, participantEmail);

            Map<String, Object> data = new HashMap<>();
            data.put("meetingId", meetingId);
            data.put("meetingTitle", meetingTitle);
            data.put("participantName", participantName);
            data.put("hostName", hostName);
            data.put("meetingLink", meetingLink);
            if (eventData.get("scheduledAt") != null) {
                data.put("scheduledAt", eventData.get("scheduledAt"));
            }

            NotificationMessage notificationMessage = NotificationMessage.builder()
                    .messageId(UUID.randomUUID().toString())
                    .event("participant.added")
                    .recipient(NotificationMessage.Recipient.builder()
                            .email(participantEmail)
                            .build())
                    .channels(java.util.Set.of(NotificationChannel.EMAIL))
                    .priority(NotificationPriority.NORMAL)
                    .data(data)
                    .createdAt(Instant.now())
                    .build();

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE,
                    RabbitMQConfig.EMAIL_ROUTING_KEY,
                    notificationMessage
            );

            log.info("Successfully queued email notification for participant: {}", participantEmail);
        } catch (Exception e) {
            log.error("Failed to handle participant added event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process participant added event", e);
        }
    }
}
