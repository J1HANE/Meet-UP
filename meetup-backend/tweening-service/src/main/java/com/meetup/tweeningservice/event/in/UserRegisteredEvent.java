package com.meetup.tweeningservice.event.in;

public record UserRegisteredEvent(
        String userId,
        String name,
        String email,
        String role
) {}
