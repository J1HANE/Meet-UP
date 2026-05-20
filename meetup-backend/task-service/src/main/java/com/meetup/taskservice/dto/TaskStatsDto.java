package com.meetup.taskservice.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Builder
@Value
public class TaskStatsDto {
    UUID                taskId;
    short               progressPercent;
    long                totalSubTasks;
    long                completedSubTasks;
    BigDecimal          subTaskCompletionRate;   // percentage, 1 dp — null if no subtasks
    BigDecimal          estimatedHours;
    BigDecimal          actualHours;
    BigDecimal          hoursVariance;           // actual - estimated, positive = over budget
    long                blockedByCount;                // dependencies this task has
    long                blockingCount;                 // tasks waiting on this one
    long                tagCount;
    long                ageInDays;
    boolean             isOverdue;
    OffsetDateTime      createdAt;
    OffsetDateTime      assignedAt;
    OffsetDateTime      startedAt;
    OffsetDateTime      completedAt;
}
