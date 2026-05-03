package com.meetup.tweeningservice.event.out;

import java.time.LocalDateTime;

public record MemberLeftEvent(
        String groupId,
        String personId,
        LocalDateTime leftAt
) {}
