package com.meetup.meetingservice.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MeetingException.class)
    public ResponseEntity<Map<String, String>> handleMeetingException(MeetingException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("errorCode", ex.getErrorCode().getCode());
        response.put("message", ex.getMessage());

        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (ex.getErrorCode() == ErrorCode.MEETING_NOT_FOUND) {
            status = HttpStatus.NOT_FOUND;
        } else if (ex.getErrorCode() == ErrorCode.INVALID_MEETING_STATE) {
            status = HttpStatus.BAD_REQUEST;
        }

        return new ResponseEntity<>(response, status);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        logger.error("Unexpected error occurred: ", ex);
        Map<String, String> response = new HashMap<>();
        response.put("errorCode", "INTERNAL_ERROR");
        response.put("message", "An unexpected error occurred: " + ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
