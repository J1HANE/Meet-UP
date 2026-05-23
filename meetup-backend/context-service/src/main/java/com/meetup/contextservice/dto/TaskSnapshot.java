package com.meetup.contextservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskSnapshot {
    private Double actualHours;
    private Integer ageInDays;
    private String assignedTo;
    private String assignedToType;
    private String baselineEnd;
    private String baselineStart;
    private Boolean blocked;
    private Integer blockedByCount;
    private Integer blockingCount;
    private List<BlockingDependency> blockingDependencies;
    private String categoryId;
    private String categoryName;
    private Integer completedSubTasks;
    private String createdBy;
    private String endDate;
    private Double estimatedHours;
    private Double hoursVariance;
    private Boolean milestone;
    private Boolean overdue;
    private String parentTaskId;
    private String parentTaskName;
    private Integer points;
    private String priority;
    private Integer progressPercent;
    private String recurrenceInterval;
    private Boolean recurring;
    private Boolean requiresReview;
    private String reviewedBy;
    private String startDate;
    private String status;
    private Double subTaskCompletionRate;
    private List<SubTask> subTasks;
    private Integer tagCount;
    private List<Tag> tags;
    private String taskDescription;
    private String taskId;
    private String taskName;
    private TaskTimeline taskTimeline;
    private Integer totalSubTasks;
    private String varianceLabel;
    private String visibility;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BlockingDependency {
        private String blockingTaskId;
        private String blockingTaskName;
        private String blockingTaskStatus;
        private String dependencyType;
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubTask {
        private String endDate;
        private String parentTaskId;
        private String priority;
        private Integer progressPercent;
        private String status;
        private String taskId;
        private String taskName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Tag {
        private String description;
        private String name;
        private String tagId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskTimeline {
        private LocalDateTime assignedAt;
        private LocalDateTime blockedAt;
        private LocalDateTime cancelledAt;
        private LocalDateTime completedAt;
        private LocalDateTime createdAt;
        private LocalDateTime deleteAt;
        private LocalDateTime lastActivityAt;
        private LocalDateTime startedAt;
        private LocalDateTime submittedAt;
        private LocalDateTime unblockedAt;
    }
}
