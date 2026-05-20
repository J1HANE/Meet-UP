package com.meetup.authservice.event;

import java.time.LocalDateTime;

public record MemberLeftEvent(
        String groupId,
        String personId,
        LocalDateTime leftAt
) {}
