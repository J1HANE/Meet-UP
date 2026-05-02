package com.meetup.tweeningservice.event.in;

import java.time.LocalDateTime;

public record MeetingEndedEvent(
        String meetingId,
        LocalDateTime endedAt
) {}
