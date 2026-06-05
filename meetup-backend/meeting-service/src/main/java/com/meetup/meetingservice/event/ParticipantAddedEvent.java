package com.meetup.meetingservice.event;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ParticipantAddedEvent {
    private String meetingId;
    private String meetingTitle;
    private String participantEmail;
    private String participantName;
    private String hostName;
    private LocalDateTime scheduledAt;
    private String meetingLink;
}
