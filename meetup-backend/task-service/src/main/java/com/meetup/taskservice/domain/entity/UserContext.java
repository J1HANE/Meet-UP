package com.meetup.taskservice.domain.entity;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class UserContext {
    private final String userId;
    private final String email;
    private final List<String> roles;
    private final List<String> tweenIds;

    public boolean hasRole(String role) {
        return roles != null && roles.contains(role);
    }
}
