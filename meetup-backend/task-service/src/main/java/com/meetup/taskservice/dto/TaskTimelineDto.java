package com.meetup.taskservice.dto;


import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class TaskTimelineDto {

    OffsetDateTime              createdAt;
    OffsetDateTime              assignedAt;
    OffsetDateTime              startedAt;
    OffsetDateTime              completedAt;
    OffsetDateTime              cancelledAt;
    OffsetDateTime              submittedAt;
    OffsetDateTime              blockedAt;
    OffsetDateTime              unblockedAt;
    OffsetDateTime              deleteAt;
    OffsetDateTime              lastActivityAt;
}
