package com.meetup.types.notifications;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum NotificationPriority {

    LOW("low"),
    NORMAL("normal"),
    HIGH("high"),
    CRITICAL("critical");

    private final String value;

    NotificationPriority(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() { return value; }

    @JsonCreator
    public static NotificationPriority from(String value) {
        for (NotificationPriority p : values()) {
            if (p.value.equalsIgnoreCase(value)) return p;
        }
        throw new IllegalArgumentException("Unknown priority: " + value);
    }
}
