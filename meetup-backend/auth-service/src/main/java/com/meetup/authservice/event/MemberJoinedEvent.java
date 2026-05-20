package com.meetup.authservice.event;

import java.time.LocalDateTime;

public record MemberJoinedEvent(
        String groupId,
        String personId,
        String role,
        LocalDateTime joinedAt
) {}
