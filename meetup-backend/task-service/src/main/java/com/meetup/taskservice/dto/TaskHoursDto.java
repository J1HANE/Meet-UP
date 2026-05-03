package com.meetup.taskservice.dto;

import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TaskHoursDto {
    @DecimalMin("0.0") private BigDecimal estimatedHours;
    @DecimalMin("0.0") private BigDecimal actualHours;
}
