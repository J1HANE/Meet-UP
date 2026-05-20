package com.meetup.taskservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskBlockResponseDto {
    private UUID blockId;
    private UUID           taskId;
    private String         reason;
    private boolean        isActive;            // derived: unblockedAt == null
    private OffsetDateTime blockedAt;
    private OffsetDateTime unblockedAt;

}
