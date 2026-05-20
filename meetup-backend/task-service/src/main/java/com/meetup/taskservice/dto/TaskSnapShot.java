package com.meetup.taskservice.dto;


import com.meetup.taskservice.domain.enums.*;
import com.meetup.taskservice.dto.response.TagResponseDto;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;


@Data
@Builder
public class TaskSnapShot {
    //General Information
    UUID                        taskId;
    String                      taskName;
    String                      taskDescription;
    TaskStatus                  status;
    TaskPriority                priority;
    TaskVisibility              visibility;
    Short                       points;
    short                       progressPercent;
    boolean                     isMilestone;
    boolean                     requiresReview;
    boolean                     isRecurring;
    RecurrenceInterval          recurrenceInterval;
    LocalDate                   startDate;
    LocalDate                   endDate;
    LocalDate                   baselineStart;
    LocalDate                   baselineEnd;
    BigDecimal                  estimatedHours;
    BigDecimal                  actualHours;
    String                      assignedTo;
    AssignedToType              assignedToType;
    String                      reviewedBy;
    String                      createdBy;
    UUID                        categoryId;
    String                      categoryName;
    UUID                        parentTaskId;
    String                      parentTaskName;
    List<TaskSummaryDto>        subTasks;
    Set<TagSummary>             tags;
    List<BlockingDependencyDto> blockingDependencies;
    //Stats
    long                        totalSubTasks;
    long                        completedSubTasks;
    BigDecimal                  subTaskCompletionRate;   // percentage, 1 dp — null if no subtasks
    BigDecimal                  hoursVariance;           // actual - estimated, positive = over budget
    String                      varianceLabel;
    long                        blockedByCount;                // dependencies this task has
    long                        blockingCount;                 // tasks waiting on this one
    long                        tagCount;
    long                        ageInDays;
    boolean                     isOverdue;
    boolean                     isBlocked;
    //Timestamps
    TaskTimelineDto             taskTimeline;
}
