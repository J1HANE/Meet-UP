package com.meetup.tweeningservice.event.out;

import java.time.LocalDateTime;

public record GroupDissolvedEvent(
        String groupId,
        String taskId,
        LocalDateTime dissolvedAt
) {}
