package com.meetup.taskservice.event;

import com.meetup.taskservice.config.RabbitMQPublisherConfig;
import com.meetup.taskservice.domain.event.TaskCompletedEvent;
import com.meetup.taskservice.domain.event.TaskCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RabbitMQEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishTaskCreated(TaskCreatedEvent event) {
        log.info("Publishing TaskCreatedEvent for task: {}", event.getTaskId());
        rabbitTemplate.convertAndSend(
            RabbitMQPublisherConfig.TASK_EVENTS_EXCHANGE,
            "task.created",
            event
        );
    }

    public void publishTaskCompleted(TaskCompletedEvent event) {
        log.info("Publishing TaskCompletedEvent for task: {}", event.getTaskId());
        rabbitTemplate.convertAndSend(
            RabbitMQPublisherConfig.TASK_EVENTS_EXCHANGE,
            "task.completed",
            event
        );
    }
}
