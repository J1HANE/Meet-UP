package com.meetup.taskservice.domain.entity;

import com.meetup.taskservice.domain.enums.RecurrenceInterval;
import com.meetup.taskservice.domain.enums.TaskPriority;
import com.meetup.taskservice.domain.enums.TaskStatus;
import com.meetup.taskservice.domain.enums.TaskVisibility;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;


@Entity
@Table(name = "tasks",
        indexes = {
                @Index(name = "idx_tasks_assigned_to", columnList = "assigned_to"),
                @Index(name = "idx_tasks_category",    columnList = "category_id"),
                @Index(name = "idx_tasks_parent",      columnList = "parent_task_id"),
                @Index(name = "idx_tasks_dates",       columnList = "start_date, end_date")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false)
    private UUID taskId;

    private String contextId;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_task_id")
    private Task parentTask;

    @OneToMany(mappedBy = "parentTask")
    private List<Task> subTasks = new ArrayList<>();


    @Column(nullable = false)
    private String taskName;

    @Column(columnDefinition = "text")
    private String taskDescription;


    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate baselineStart;
    private LocalDate baselineEnd;

    @Column(nullable = false)
    private short progressPercent = 0;

    @Column(precision = 6, scale = 2)
    private BigDecimal estimatedHours;

    @Column(precision = 6, scale = 2)
    private BigDecimal actualHours;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskPriority priority = TaskPriority.NORMAL;


    private Short points;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;


    private String createdBy;


    private String assignedTo;


    private String reviewedBy;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status = TaskStatus.IN_BACKLOG;

    @Column(nullable = false)
    private boolean requiresReview = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskVisibility visibility = TaskVisibility.PUBLIC;


    @Column(nullable = false)
    private boolean isRecurring = false;

    @Enumerated(EnumType.STRING)
    private RecurrenceInterval recurrenceInterval;


    @Column(nullable = false)
    private boolean isMilestone = false;


    @ManyToMany
    @JoinTable(
            name = "task_tags",
            joinColumns        = @JoinColumn(name = "task_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();


    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TaskDependency> dependencies = new HashSet<>();


    @OneToMany(mappedBy = "dependsOnTask")
    private Set<TaskDependency> dependents = new HashSet<>();


    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TaskBlock> blockHistory = new ArrayList<>();




    @Column(nullable = false)
    private OffsetDateTime lastActivityAt = OffsetDateTime.now();

    private OffsetDateTime deletedAt;


    @Column(nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    private OffsetDateTime assignedAt;
    private OffsetDateTime startedAt;
    private OffsetDateTime blockedAt;
    private OffsetDateTime unblockedAt;
    private OffsetDateTime submittedAt;
    private OffsetDateTime completedAt;
    private OffsetDateTime cancelledAt;
}
