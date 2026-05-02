package com.meetup.tweeningservice.event.in;

import java.time.LocalDateTime;

public record TaskCreatedEvent(
        String taskId,
        String title,
        String creatorId,
        LocalDateTime createdAt
) {}
