package com.meetup.tweeningservice.event.in;

import com.meetup.tweeningservice.config.RabbitMQConfig;
import com.meetup.tweeningservice.service.GroupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@RabbitListener(queues = RabbitMQConfig.TASK_EVENTS_QUEUE)
public class RabbitMQEventListener {

    private final GroupService groupService;

    @org.springframework.amqp.rabbit.annotation.RabbitHandler
    public void onTaskCreatedEvent(TaskCreatedEvent taskCreatedEvent) {
        log.info("Received task.created event: {}", taskCreatedEvent);
        groupService.createLatentGroup(taskCreatedEvent.taskId());
    }

    @org.springframework.amqp.rabbit.annotation.RabbitHandler
    public void onTaskCompletedEvent(TaskCompletedEvent taskCompletedEvent) {
        log.info("Received task.completed event: {}", taskCompletedEvent);
        groupService.dissolveGroupForTask(taskCompletedEvent.taskId());
    }

    @org.springframework.amqp.rabbit.annotation.RabbitHandler(isDefault = true)
    public void onDefaultEvent(Object event) {
        log.warn("Received unknown event type: {}", event.getClass());
    }
}
