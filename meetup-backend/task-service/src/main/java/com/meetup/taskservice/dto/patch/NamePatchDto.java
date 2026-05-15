package com.meetup.taskservice.dto.patch;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record NamePatchDto(@NotBlank @Min (1) @Max(255) String name) {
}
