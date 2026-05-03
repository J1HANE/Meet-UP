package com.meetup.taskservice.dto.gantt;

import com.meetup.taskservice.domain.enums.AssignedToType;
import com.meetup.taskservice.domain.enums.TaskPriority;
import com.meetup.taskservice.domain.enums.TaskStatus;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Builder
@Value
public class GanttTaskDto {

    UUID taskId;
    String taskName;
    int    depth;           // 0 = root, 1 = child, 2 = grandchild …

    // Scheduling
    LocalDate startDate;
    LocalDate endDate;
    LocalDate baselineStart;
    LocalDate baselineEnd;

    // Progress & state
    short          progressPercent;
    TaskStatus status;
    TaskPriority priority;
    boolean        isMilestone;
    boolean        isOverdue;
    boolean        isCriticalPath;   // set by service analysis

    // Relationships
    UUID   parentTaskId;
    List<UUID> dependsOnTaskIds;    // IDs this task waits for

    // People
    String assignedTo;
    AssignedToType assignedToType;

    // Display hints
    String categoryName;
    String categoryColor;
}
