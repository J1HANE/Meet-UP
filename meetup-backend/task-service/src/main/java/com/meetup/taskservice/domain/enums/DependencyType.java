package com.meetup.taskservice.domain.enums;

public enum DependencyType {
    FINISH_TO_START, // B cannot start until A finsishes
    START_TO_START, // B cannot start until A starts
    FINISH_TO_FINISH, // B cannot finish until A finishes
    START_TO_FINISH, // B cannot finish until A starts
}
