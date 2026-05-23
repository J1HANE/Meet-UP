package com.meetup.tweeningservice.event.in;

import com.meetup.tweeningservice.service.GroupService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class RabbitMQEventListenerTest {

    @Mock
    private GroupService groupService;

    @InjectMocks
    private RabbitMQEventListener listener;

    @Test
    void onTaskEvent_shouldHandleTaskCreatedEvent() {
        String taskId = "task-123";
        TaskCreatedEvent event = new TaskCreatedEvent(taskId, "Task Title", "creator-123", List.of("tag1"), "HIGH", "TODO", LocalDateTime.now());

        listener.onTaskCreatedEvent(event);

        verify(groupService).saveOrUpdateTask(taskId, "Task Title", List.of("tag1"), "HIGH", "TODO");
        verify(groupService).createLatentGroup(taskId);
    }

    @Test
    void onTaskEvent_shouldHandleTaskUpdatedEvent() {
        String taskId = "task-123";
        TaskUpdatedEvent event = new TaskUpdatedEvent(taskId, "Task Title", "creator-123", List.of("tag1"), "HIGH", "COMPLETED");

        listener.onTaskUpdatedEvent(event);

        verify(groupService).updateTask(taskId, "Task Title", List.of("tag1"), "HIGH", "COMPLETED");
    }

    @Test
    void onTaskEvent_shouldHandleTaskCompletedEvent() {
        String taskId = "task-123";
        TaskCompletedEvent event = new TaskCompletedEvent(taskId, LocalDateTime.now());

        listener.onTaskCompletedEvent(event);

        verify(groupService).dissolveGroupForTask(taskId);
    }

    @Test
    void onUserEvent_shouldHandleUserRegisteredEvent() {
        String userId = "user-123";
        UserRegisteredEvent event = new UserRegisteredEvent(userId, "Alice", "alice@example.com", "DEVELOPER");

        listener.onUserRegisteredEvent(event);

        verify(groupService).saveOrUpdatePerson(userId, "Alice", "alice@example.com", "DEVELOPER");
    }

    @Test
    void onUserEvent_shouldHandleUserUpdatedEvent() {
        String userId = "user-123";
        UserUpdatedEvent event = new UserUpdatedEvent(userId, "Alice Updated", "alice@example.com", "LEAD");

        listener.onUserUpdatedEvent(event);

        verify(groupService).saveOrUpdatePerson(userId, "Alice Updated", "alice@example.com", "LEAD");
    }

    @Test
    void onMeetingEvent_shouldHandleMeetingStartedEvent() {
        String meetingId = "meet-123";
        LocalDateTime startedAt = LocalDateTime.now();
        MeetingStartedEvent event = new MeetingStartedEvent(meetingId, "Planning", "SYNC", startedAt, "parent-123");

        listener.onMeetingStartedEvent(event);

        verify(groupService).saveOrUpdateMeeting(meetingId, "Planning", "SYNC", startedAt, "parent-123");
    }

    @Test
    void onMeetingEvent_shouldHandleMeetingEndedEvent() {
        String meetingId = "meet-123";
        LocalDateTime endedAt = LocalDateTime.now();
        MeetingEndedEvent event = new MeetingEndedEvent(meetingId, endedAt);

        listener.onMeetingEndedEvent(event);

        verify(groupService).endMeeting(meetingId, endedAt);
    }

    @Test
    void onMeetingEvent_shouldHandleSubmeetingSpawnedEvent() {
        String meetingId = "meet-123";
        LocalDateTime startedAt = LocalDateTime.now();
        SubmeetingSpawnedEvent event = new SubmeetingSpawnedEvent(meetingId, "Retro", "SYNC", startedAt, "parent-123");

        listener.onSubmeetingSpawnedEvent(event);

        verify(groupService).saveOrUpdateMeeting(meetingId, "Retro", "SYNC", startedAt, "parent-123");
    }
}
