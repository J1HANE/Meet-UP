package com.meetup.meetingservice.exception;

import org.springframework.http.HttpStatus;

public class MeetingServiceException extends RuntimeException {

    private final MeetingErrorCode errorCode;
    private final HttpStatus status;

    public MeetingServiceException(MeetingErrorCode errorCode, HttpStatus status, String message) {
        super(message);
        this.errorCode = errorCode;
        this.status = status;
    }

    public MeetingErrorCode getErrorCode() {
        return errorCode;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
