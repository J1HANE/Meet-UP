package com.meetup.tweeningservice.event.in;

import java.util.List;

public record TaskUpdatedEvent(
        String taskId,
        String title,
        String creatorId,
        List<String> tags,
        String priority,
        String status
) {}
