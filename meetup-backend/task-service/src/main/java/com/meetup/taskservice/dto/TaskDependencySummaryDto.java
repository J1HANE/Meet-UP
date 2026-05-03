package com.meetup.taskservice.dto;

import lombok.Value;

import java.util.List;
import java.util.UUID;

@Value
public class TaskDependencySummaryDto {
    List<UUID> blockedByTaskIds;    // tasks this task depends on
    List<UUID> blockingTaskIds;     // tasks that depend on this task
}
