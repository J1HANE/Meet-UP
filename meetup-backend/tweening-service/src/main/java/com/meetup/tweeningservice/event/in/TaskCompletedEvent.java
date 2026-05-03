package com.meetup.tweeningservice.event.in;

import java.time.LocalDateTime;

public record TaskCompletedEvent(
        String taskId,
        LocalDateTime completedAt
) {}
