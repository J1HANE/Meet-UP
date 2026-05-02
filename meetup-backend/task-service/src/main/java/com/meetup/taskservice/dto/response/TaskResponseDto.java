package com.meetup.taskservice.dto.response;

import com.meetup.taskservice.domain.enums.RecurrenceInterval;
import com.meetup.taskservice.domain.enums.TaskPriority;
import com.meetup.taskservice.domain.enums.TaskStatus;
import com.meetup.taskservice.domain.enums.TaskVisibility;
import com.meetup.taskservice.dto.CategorySummaryDto;
import com.meetup.taskservice.dto.TagDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponseDto {
    private UUID taskId;
    private String           contextId;
    private UUID             parentTaskId;
    private int              subTaskCount;
    private String           taskName;
    private String           taskDescription;
    private LocalDate startDate;
    private LocalDate        endDate;
    private LocalDate        baselineStart;
    private LocalDate        baselineEnd;
    private short            progressPercent;
    private BigDecimal estimatedHours;
    private BigDecimal       actualHours;
    private TaskPriority priority;
    private Short            points;
    private CategorySummaryDto category;        // from CategoryMapper
    private String           createdBy;
    private String           assignedTo;
    private String           reviewedBy;
    private TaskStatus status;
    private boolean          requiresReview;
    private TaskVisibility visibility;
    private boolean          isRecurring;
    private RecurrenceInterval recurrenceInterval;
    private boolean          isMilestone;
    private Set<TagDto>      tags;              // from TagMapper
    private Set<UUID> dependencyIds;     // just IDs — avoid deep nesting
    private OffsetDateTime lastActivityAt;
    private OffsetDateTime   createdAt;
    private OffsetDateTime   assignedAt;
    private OffsetDateTime   startedAt;
    private OffsetDateTime   completedAt;
    private OffsetDateTime   cancelledAt;
    // blockedAt, unblockedAt, submittedAt, deletedAt intentionally omitted
}
