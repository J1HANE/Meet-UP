package com.meetup.taskservice.dto.patch;

import com.meetup.taskservice.domain.enums.AssignedToType;
import jakarta.validation.constraints.NotBlank;

public record AssignPatchDto(
        @NotBlank String assignedTo,
        AssignedToType assignedToType
) {}
