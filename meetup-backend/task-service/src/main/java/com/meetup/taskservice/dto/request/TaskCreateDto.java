package com.meetup.taskservice.dto.request;

import com.meetup.taskservice.domain.enums.AssignedToType;
import com.meetup.taskservice.domain.enums.RecurrenceInterval;
import com.meetup.taskservice.domain.enums.TaskPriority;
import com.meetup.taskservice.domain.enums.TaskVisibility;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskCreateDto {

    @NotBlank
    private String              taskName;
    private String              taskDescription;

    private UUID                parentTaskId;      // resolved to Task in service
    private UUID                categoryId;        // resolved to Category in service
    private Set<UUID>           tagIds;            // resolved to Set<Tag> in service
    private Set<UUID>           dependencyIds;     // resolved to TaskDependency in service


    private LocalDate           startDate;
    private LocalDate           endDate;
    private LocalDate           baselineStart;
    private LocalDate           baselineEnd;

    @DecimalMin("0.00")
    @DecimalMax("9999.99")
    private BigDecimal          estimatedHours;

    private TaskPriority        priority;
    private Short               points;
    private String              assignedTo;
    private AssignedToType      assignedToType;
    private String              reviewedBy;
    private boolean             requiresReview;
    private TaskVisibility      visibility;
    private boolean             isRecurring;
    private RecurrenceInterval  recurrenceInterval;
    private boolean             isMilestone;
}
