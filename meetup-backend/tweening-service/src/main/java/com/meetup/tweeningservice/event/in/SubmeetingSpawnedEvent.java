package com.meetup.tweeningservice.event.in;

import java.time.LocalDateTime;

public record SubmeetingSpawnedEvent(
        String meetingId,
        String title,
        String type,
        LocalDateTime startedAt,
        String parentMeetingId
) {}
