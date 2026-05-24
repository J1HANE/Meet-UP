package com.meetup.meetingservice.security;

import java.util.List;
import java.util.UUID;

public record AuthenticatedUser(
        UUID userId,
        String email,
        String displayName,
        List<String> roles,
        List<UUID> tweenIds
) {
}
