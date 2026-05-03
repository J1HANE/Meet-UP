package com.meetup.taskservice.dto.patch;

import com.meetup.taskservice.domain.enums.TaskVisibility;
import jakarta.validation.constraints.NotNull;

public record VisibilityPatchDto(@NotNull TaskVisibility visibility) {}
