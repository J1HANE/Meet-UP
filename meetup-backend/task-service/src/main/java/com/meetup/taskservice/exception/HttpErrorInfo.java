package com.meetup.taskservice.exception;

import org.springframework.http.HttpStatus;

import java.time.OffsetDateTime;

public record HttpErrorInfo(
        OffsetDateTime timestamp,
        String path,
        HttpStatus httpStatus,
        String message
) {
    public HttpErrorInfo(HttpStatus httpStatus, String path, String message) {
        this(OffsetDateTime.now(), path, httpStatus, message);
    }
}
