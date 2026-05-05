package com.meetup.types.notifications;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum NotificationChannel {

    EMAIL("email"),
    SMS("sms"),
    PUSH("push"),
    IN_APP("in_app");

    private final String value;

    NotificationChannel(String value) {
        this.value = value;
    }


    @JsonValue
    public String getValue() {
        return value;
    }


    @JsonCreator
    public static NotificationChannel from(String value) {
        for (NotificationChannel channel : values()) {
            if (channel.value.equalsIgnoreCase(value)) {
                return channel;
            }
        }
        throw new IllegalArgumentException("Unknown notification channel: " + value);
    }
}

