package com.meetup.taskservice.domain.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskCreatedEvent {
    private String taskId;
    private String title;
    private String creatorId;
    private List<String> tags;
    private String priority;
    private String status;
    private LocalDateTime createdAt;
}
