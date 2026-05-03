package com.meetup.taskservice.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskDatesDto {
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate baselineStart;
    private LocalDate baselineEnd;
}
