package com.meetup.taskservice.publisher;

import com.meetup.taskservice.config.RabbitMQPublisherConfig;
import com.meetup.types.notifications.NotificationChannel;
import com.meetup.types.notifications.NotificationMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publish(NotificationMessage message, NotificationChannel channel) {
        String routingKey = "notifications." + channel.name().toLowerCase();

        rabbitTemplate.convertAndSend(
                RabbitMQPublisherConfig.NOTIFICATIONS_EXCHANGE,
                routingKey,
                message
        );

        log.info("Published {} notification for event '{}' messageId={}",
                channel, message.getEvent(), message.getMessageId());
    }


    public void publishToChannels(NotificationMessage message, List<NotificationChannel> channels) {
        channels.forEach(channel -> publish(message, channel));
    }
}
