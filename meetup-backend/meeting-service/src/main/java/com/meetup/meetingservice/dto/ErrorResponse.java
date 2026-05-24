package com.meetup.meetingservice.dto;

import java.time.Instant;
import java.util.Map;

public record ErrorResponse(
        String code,
        String message,
        Map<String, Object> details,
        Instant timestamp,
        String path
) {
}
