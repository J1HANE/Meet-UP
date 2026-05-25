package com.meetup.meetingservice.event;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class MeetingStartedEvent {
    private String meetingId;
    private String title;
    private String type;
    private LocalDateTime startedAt;
    private String parentMeetingId;
}
