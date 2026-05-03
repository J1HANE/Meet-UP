package com.meetup.tweeningservice.event.in;

import java.time.LocalDateTime;

public record MeetingStartedEvent(
        String meetingId,
        String title,
        String type,
        LocalDateTime startedAt
) {}
