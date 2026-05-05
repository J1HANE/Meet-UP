package com.meetup.taskservice.dto.context;

public record UserContext(
        String userId,
        String email,
        String role
) {}
