package com.meetup.meetingservice.exception;

import org.springframework.http.HttpStatus;

public class ExternalIntegrationException extends MeetingServiceException {

    public ExternalIntegrationException(MeetingErrorCode errorCode, String message) {
        super(errorCode, HttpStatus.BAD_GATEWAY, message);
    }
}
