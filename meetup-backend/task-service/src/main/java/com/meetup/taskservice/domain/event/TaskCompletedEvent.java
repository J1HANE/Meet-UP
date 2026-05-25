package com.meetup.taskservice.domain.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskCompletedEvent {
    private String taskId;
    private LocalDateTime completedAt;
}
