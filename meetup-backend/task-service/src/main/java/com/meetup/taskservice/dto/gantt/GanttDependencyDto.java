package com.meetup.taskservice.dto.gantt;

import com.meetup.taskservice.domain.enums.DependencyType;
import lombok.Value;

import java.util.UUID;

@Value
public class GanttDependencyDto {
    UUID fromTaskId;    // dependsOnTask (predecessor)
    UUID           toTaskId;      // task (successor)
    DependencyType type;
    short          lagDays;
}
