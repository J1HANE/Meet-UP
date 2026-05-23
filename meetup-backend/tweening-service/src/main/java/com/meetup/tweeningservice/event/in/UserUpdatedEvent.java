package com.meetup.tweeningservice.event.in;

public record UserUpdatedEvent(
        String userId,
        String name,
        String email,
        String updatedRole
) {}
