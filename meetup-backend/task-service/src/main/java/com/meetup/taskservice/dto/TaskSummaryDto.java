package com.meetup.taskservice.dto;

import com.meetup.taskservice.domain.enums.TaskPriority;
import com.meetup.taskservice.domain.enums.TaskStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class TaskSummaryDto {
    private UUID taskId;
    private UUID         parentTaskId;
    private String       taskName;
    private TaskStatus status;
    private TaskPriority priority;
    private short        progressPercent;
    private LocalDate endDate;
}

