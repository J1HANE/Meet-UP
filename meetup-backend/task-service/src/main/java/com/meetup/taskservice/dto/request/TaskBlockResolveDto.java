package com.meetup.taskservice.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskBlockResolveDto {
    @NotBlank
    private String resolvedBy;   // unblockedAt stamped by the mapper expression
}
