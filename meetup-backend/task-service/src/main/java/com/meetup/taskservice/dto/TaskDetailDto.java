package com.meetup.taskservice.dto;

import com.meetup.taskservice.domain.enums.*;
import com.meetup.taskservice.dto.response.TagResponseDto;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Builder
@Value
public class TaskDetailDto {
    UUID taskId;
    String taskName;
    String taskDescription;
    TaskStatus status;
    TaskPriority priority;
    TaskVisibility visibility;
    Short points;
    short progressPercent;
    boolean isMilestone;
    boolean requiresReview;
    boolean isRecurring;
    RecurrenceInterval recurrenceInterval;
    LocalDate startDate;
    LocalDate endDate;
    LocalDate baselineStart;
    LocalDate baselineEnd;
    BigDecimal estimatedHours;
    BigDecimal actualHours;
    String assignedTo;
    AssignedToType assignedToType;
    String reviewedBy;
    String createdBy;
    UUID categoryId;
    String categoryName;
    UUID parentTaskId;
    String parentTaskName;
    List<TaskSummaryDto> subTasks;
    Set<TagResponseDto> tags;
    OffsetDateTime createdAt;
    OffsetDateTime assignedAt;
    OffsetDateTime startedAt;
    OffsetDateTime completedAt;
    OffsetDateTime lastActivityAt;
}
