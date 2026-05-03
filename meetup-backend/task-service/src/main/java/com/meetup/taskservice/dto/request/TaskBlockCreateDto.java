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
public class TaskBlockCreateDto {
    // taskId comes from the path variable — not in the body
    @NotBlank
    private String blockedBy;

    @NotBlank
    private String reason;
}
