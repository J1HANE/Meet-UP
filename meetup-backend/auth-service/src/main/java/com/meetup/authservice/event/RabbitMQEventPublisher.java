package com.meetup.authservice.event;

import com.meetup.authservice.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RabbitMQEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishUserRegistered(UserRegisteredEvent event) {
        log.info("Publishing UserRegisteredEvent for user: {}", event.getUserId());
        rabbitTemplate.convertAndSend(
            "auth-events-exchange",
            "user.registered",
            event
        );
    }

    public void publishUserUpdated(UserUpdatedEvent event) {
        log.info("Publishing UserUpdatedEvent for user: {}", event.getUserId());
        rabbitTemplate.convertAndSend(
            "auth-events-exchange",
            "user.updated",
            event
        );
    }
}
