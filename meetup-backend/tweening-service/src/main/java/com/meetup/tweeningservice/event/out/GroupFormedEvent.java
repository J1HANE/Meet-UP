package com.meetup.tweeningservice.event.out;

import java.time.LocalDateTime;

public record GroupFormedEvent(
        String groupId,
        String taskId,
        String meetingId,
        String ownerId,
        LocalDateTime formedAt
) {}
