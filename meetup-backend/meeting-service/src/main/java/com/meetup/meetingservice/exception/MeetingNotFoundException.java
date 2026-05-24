package com.meetup.meetingservice.exception;

import org.springframework.http.HttpStatus;

import java.util.UUID;

public class MeetingNotFoundException extends MeetingServiceException {

    public MeetingNotFoundException(UUID meetingId) {
        super(MeetingErrorCode.MEETING_NOT_FOUND, HttpStatus.NOT_FOUND,
                "Meeting with id " + meetingId + " was not found");
    }
}
