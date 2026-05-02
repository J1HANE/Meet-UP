package com.meetup.taskservice.dto.response;

import com.meetup.taskservice.domain.enums.DependencyType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDependencyResponseDto {
    private UUID taskId;
    private UUID           dependsOnTaskId;
    private String         dependsOnTaskName;   // convenience — saves a second call
    private DependencyType dependencyType;
    private short          lagDays;
}
