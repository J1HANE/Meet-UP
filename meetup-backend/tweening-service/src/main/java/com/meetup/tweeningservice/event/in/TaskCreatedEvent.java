package com.meetup.tweeningservice.event.in;

import java.time.LocalDateTime;
import java.util.List;

public record TaskCreatedEvent(
        String taskId,
        String title,
        String creatorId,
        List<String> tags,
        String priority,
        String status,
        LocalDateTime createdAt
) {}
