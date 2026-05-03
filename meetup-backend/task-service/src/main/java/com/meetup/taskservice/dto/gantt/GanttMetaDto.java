package com.meetup.taskservice.dto.gantt;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
@Value
public class GanttMetaDto {
    LocalDate projectStart;      // earliest startDate across all tasks
    LocalDate projectEnd;        // latest endDate across all tasks
    LocalDate today;
    long totalTasks;
    long completedTasks;
    long overdueTasks;
    long milestoneTasks;
    BigDecimal overallProgressPercent;  // weighted average by task count
}
