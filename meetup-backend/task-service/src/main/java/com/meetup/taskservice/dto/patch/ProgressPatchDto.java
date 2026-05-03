package com.meetup.taskservice.dto.patch;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record ProgressPatchDto(
        @Min(0) @Max(100) short progressPercent
) {}
