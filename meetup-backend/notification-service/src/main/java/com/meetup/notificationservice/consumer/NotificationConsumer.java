package com.meetup.notificationservice.consumer;

import com.meetup.notificationservice.channel.NotificationStrategyFactory;
import com.meetup.notificationservice.config.RabbitMQConfig;
import com.meetup.types.notifications.NotificationMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final NotificationStrategyFactory strategyFactory;

    // One listener per queue — Spring creates separate threads for each
    @RabbitListener(queues = RabbitMQConfig.EMAIL_QUEUE)
    public void handleEmail(NotificationMessage message) {
        handle(message, "email");
    }

    @RabbitListener(queues = RabbitMQConfig.SMS_QUEUE)
    public void handleSms(NotificationMessage message) {
        handle(message, "sms");
    }

    @RabbitListener(queues = RabbitMQConfig.PUSH_QUEUE)
    public void handlePush(NotificationMessage message) {
        handle(message, "push");
    }

    private void handle(NotificationMessage message, String channel) {
        log.info("Received {} notification for event '{}' messageId={}",
                channel, message.getEvent(), message.getMessageId());
        try {
            strategyFactory.getStrategy(channel).send(message);
        } catch (Exception e) {
            // Throwing here causes Spring AMQP to nack the message
            // → RabbitMQ routes it to the DLQ after max retries
            log.error("Failed to process {} notification: {}", channel, e.getMessage());
            throw new RuntimeException("Notification delivery failed", e);
        }
    }
}
