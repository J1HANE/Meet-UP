package com.meetup.meetingservice.exception;

import org.springframework.http.HttpStatus;

public class MeetingValidationException extends MeetingServiceException {

    public MeetingValidationException(String message) {
        super(MeetingErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST, message);
    }
}
