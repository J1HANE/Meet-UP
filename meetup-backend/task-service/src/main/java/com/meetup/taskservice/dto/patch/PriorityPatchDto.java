package com.meetup.taskservice.dto.patch;

import com.meetup.taskservice.domain.enums.TaskPriority;
import jakarta.validation.constraints.NotNull;

public record PriorityPatchDto(@NotNull TaskPriority priority) {}
