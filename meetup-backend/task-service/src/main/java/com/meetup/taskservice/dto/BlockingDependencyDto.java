package com.meetup.taskservice.dto;

import com.meetup.taskservice.domain.enums.DependencyType;
import com.meetup.taskservice.domain.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class BlockingDependencyDto {
    private UUID            blockingTaskId;
    private String          blockingTaskName;
    private TaskStatus      blockingTaskStatus;
    private DependencyType  dependencyType;
    private String          reason;           // human-readable, ready for the frontend
}
