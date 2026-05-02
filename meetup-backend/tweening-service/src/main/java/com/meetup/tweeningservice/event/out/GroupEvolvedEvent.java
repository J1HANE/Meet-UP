package com.meetup.tweeningservice.event.out;

import java.time.LocalDateTime;

public record GroupEvolvedEvent(
        String groupId,
        String reason, // SPLIT, MERGE, ROLE_CHANGE, TRANSFER
        LocalDateTime evolvedAt
) {}
