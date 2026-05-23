package com.meetup.aiservice.exception;

public class LlmCallException extends RuntimeException {
    public LlmCallException(String message, Throwable cause) {
        super(message, cause);
    }
}
