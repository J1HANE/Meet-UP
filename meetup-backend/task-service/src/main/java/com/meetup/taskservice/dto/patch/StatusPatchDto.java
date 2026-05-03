package com.meetup.taskservice.dto.patch;

import com.meetup.taskservice.domain.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record StatusPatchDto(@NotNull TaskStatus status) {}
