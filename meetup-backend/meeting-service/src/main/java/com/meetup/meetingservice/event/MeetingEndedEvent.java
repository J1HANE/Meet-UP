package com.meetup.meetingservice.event;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class MeetingEndedEvent {
    private String meetingId;
    private LocalDateTime endedAt;
}
