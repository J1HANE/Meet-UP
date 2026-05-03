package com.meetup.taskservice.dto.gantt;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Builder
@Value
public class GanttResponseDto {
    GanttMetaDto          meta;
    List<GanttTaskDto> tasks;        // ordered: parent before children
    List<GanttDependencyDto> dependencies;
}
