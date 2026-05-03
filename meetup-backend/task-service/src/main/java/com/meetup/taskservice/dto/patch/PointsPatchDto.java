package com.meetup.taskservice.dto.patch;

import jakarta.validation.constraints.NotNull;

public record PointsPatchDto(@NotNull Short points) {}