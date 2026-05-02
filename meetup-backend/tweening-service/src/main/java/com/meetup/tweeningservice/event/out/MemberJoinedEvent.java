package com.meetup.tweeningservice.event.out;

import java.time.LocalDateTime;

public record MemberJoinedEvent(
        String groupId,
        String personId,
        String role,
        LocalDateTime joinedAt
) {}
