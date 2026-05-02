package com.meetup.taskservice.exception;

import java.util.UUID;

public class EntityNotFoundException extends RuntimeException {
    public EntityNotFoundException(String message) {
        super(message);
    }

    public EntityNotFoundException(UUID taskId) {
        super("No task found with id: " + taskId);
    }
}
