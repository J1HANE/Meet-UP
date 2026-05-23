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
@RabbitListener(queues = {
        RabbitMQConfig.TASK_EVENTS_QUEUE,
        RabbitMQConfig.AUTH_EVENTS_QUEUE,
        RabbitMQConfig.MEETING_EVENTS_QUEUE
})
public class RabbitMQEventListener {

    private final GroupService groupService;

    // --- Task Events ---

    @org.springframework.amqp.rabbit.annotation.RabbitHandler
    public void onTaskCreatedEvent(TaskCreatedEvent taskCreatedEvent) {
        log.info("Received task.created event: {}", taskCreatedEvent);
        groupService.saveOrUpdateTask(taskCreatedEvent.taskId(), taskCreatedEvent.title(), taskCreatedEvent.tags(), taskCreatedEvent.priority(), taskCreatedEvent.status());
        groupService.createLatentGroup(taskCreatedEvent.taskId());
    }

    @org.springframework.amqp.rabbit.annotation.RabbitHandler
    public void onTaskUpdatedEvent(TaskUpdatedEvent taskUpdatedEvent) {
        log.info("Received task.updated event: {}", taskUpdatedEvent);
        groupService.updateTask(taskUpdatedEvent.taskId(), taskUpdatedEvent.title(), taskUpdatedEvent.tags(), taskUpdatedEvent.priority(), taskUpdatedEvent.status());
    }

    @org.springframework.amqp.rabbit.annotation.RabbitHandler
    public void onTaskCompletedEvent(TaskCompletedEvent taskCompletedEvent) {
        log.info("Received task.completed event: {}", taskCompletedEvent);
        groupService.dissolveGroupForTask(taskCompletedEvent.taskId());
    }

    // --- Auth Events ---

    @org.springframework.amqp.rabbit.annotation.RabbitHandler
    public void onUserRegisteredEvent(UserRegisteredEvent userRegisteredEvent) {
        log.info("Received user.registered event: {}", userRegisteredEvent);
        groupService.saveOrUpdatePerson(userRegisteredEvent.userId(), userRegisteredEvent.name(), userRegisteredEvent.email(), userRegisteredEvent.role());
    }

    @org.springframework.amqp.rabbit.annotation.RabbitHandler
    public void onUserUpdatedEvent(UserUpdatedEvent userUpdatedEvent) {
        log.info("Received user.updated event: {}", userUpdatedEvent);
        groupService.saveOrUpdatePerson(userUpdatedEvent.userId(), userUpdatedEvent.name(), userUpdatedEvent.email(), userUpdatedEvent.updatedRole());
    }

    // --- Meeting Events ---

    @org.springframework.amqp.rabbit.annotation.RabbitHandler
    public void onMeetingStartedEvent(MeetingStartedEvent meetingStartedEvent) {
        log.info("Received meeting.started event: {}", meetingStartedEvent);
        groupService.saveOrUpdateMeeting(meetingStartedEvent.meetingId(), meetingStartedEvent.title(), meetingStartedEvent.type(), meetingStartedEvent.startedAt(), meetingStartedEvent.parentMeetingId());
    }

    @org.springframework.amqp.rabbit.annotation.RabbitHandler
    public void onMeetingEndedEvent(MeetingEndedEvent meetingEndedEvent) {
        log.info("Received meeting.ended event: {}", meetingEndedEvent);
        groupService.endMeeting(meetingEndedEvent.meetingId(), meetingEndedEvent.endedAt());
    }

    @org.springframework.amqp.rabbit.annotation.RabbitHandler
    public void onSubmeetingSpawnedEvent(SubmeetingSpawnedEvent submeetingSpawnedEvent) {
        log.info("Received submeeting.spawned event: {}", submeetingSpawnedEvent);
        groupService.saveOrUpdateMeeting(submeetingSpawnedEvent.meetingId(), submeetingSpawnedEvent.title(), submeetingSpawnedEvent.type(), submeetingSpawnedEvent.startedAt(), submeetingSpawnedEvent.parentMeetingId());
    }

    // --- Fallback ---

    @org.springframework.amqp.rabbit.annotation.RabbitHandler(isDefault = true)
    public void onDefaultEvent(Object event) {
        log.warn("Received unknown event type: {}", event.getClass());
    }
}
