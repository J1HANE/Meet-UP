package com.meetup.meetingservice.exception;

public enum ErrorCode {
    MEETING_NOT_FOUND("MEETING_001", "Meeting not found"),
    DAILY_API_ERROR("MEETING_002", "Error communicating with Daily.co"),
    STREAM_CONFIGURATION_ERROR("MEETING_004", "Stream credentials are missing or invalid"),
    STREAM_API_ERROR("MEETING_005", "Error communicating with Stream API"),
    INVALID_MEETING_STATE("MEETING_003", "Invalid meeting state for this operation");

    private final String code;
    private final String message;

    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() { return code; }
    public String getMessage() { return message; }
}
