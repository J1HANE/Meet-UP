package com.meetup.tweeningservice.event.in;

import com.meetup.tweeningservice.service.GroupService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

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
        TaskCreatedEvent event = new TaskCreatedEvent(taskId, "Task Title", "Description", LocalDateTime.now());

        listener.onTaskEvent(event);

        verify(groupService).createLatentGroup(taskId);
    }

    @Test
    void onTaskEvent_shouldHandleTaskCompletedEvent() {
        String taskId = "task-123";
        TaskCompletedEvent event = new TaskCompletedEvent(taskId, LocalDateTime.now());

        listener.onTaskEvent(event);

        verify(groupService).dissolveGroupForTask(taskId);
    }
}
