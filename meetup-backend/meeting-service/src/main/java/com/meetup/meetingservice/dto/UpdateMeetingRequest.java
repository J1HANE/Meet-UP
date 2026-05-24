package com.meetup.meetingservice.dto;

import com.meetup.meetingservice.model.MeetingStatus;

import java.time.Instant;

public record UpdateMeetingRequest(
        String title,
        Instant scheduledAt,
        MeetingStatus status
) {
}
