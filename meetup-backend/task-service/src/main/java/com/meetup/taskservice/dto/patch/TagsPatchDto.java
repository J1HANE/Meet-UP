package com.meetup.taskservice.dto.patch;

import jakarta.validation.constraints.NotNull;

import java.util.Set;
import java.util.UUID;

public record TagsPatchDto(@NotNull Set<UUID> tagIds) {}
