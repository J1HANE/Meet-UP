package com.meetup.tweeningservice.event.out;

import com.meetup.tweeningservice.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RabbitMQEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishGroupFormed(GroupFormedEvent event) {
        log.info("Publishing group.formed event: {}", event);
        rabbitTemplate.convertAndSend(RabbitMQConfig.GROUP_EVENTS_EXCHANGE, "group.formed", event);
    }

    public void publishGroupEvolved(GroupEvolvedEvent event) {
        log.info("Publishing group.evolved event: {}", event);
        rabbitTemplate.convertAndSend(RabbitMQConfig.GROUP_EVENTS_EXCHANGE, "group.evolved", event);
    }

    public void publishGroupDissolved(GroupDissolvedEvent event) {
        log.info("Publishing group.dissolved event: {}", event);
        rabbitTemplate.convertAndSend(RabbitMQConfig.GROUP_EVENTS_EXCHANGE, "group.dissolved", event);
    }

    public void publishMemberJoined(MemberJoinedEvent event) {
        log.info("Publishing member.joined event: {}", event);
        rabbitTemplate.convertAndSend(RabbitMQConfig.GROUP_EVENTS_EXCHANGE, "member.joined", event);
    }

    public void publishMemberLeft(MemberLeftEvent event) {
        log.info("Publishing member.left event: {}", event);
        rabbitTemplate.convertAndSend(RabbitMQConfig.GROUP_EVENTS_EXCHANGE, "member.left", event);
    }
}
