package com.meetup.taskservice.dto.patch;

import jakarta.validation.constraints.NotNull;

public record ReviewerPatchDto(@NotNull String reviewedBy) {}
