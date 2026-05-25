package com.meetup.authservice.event;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserRegisteredEvent {
    private String userId;
    private String name;
    private String email;
    private String role;
}
