package com.meetup.meetingservice.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class CurrentUserService {

    public Optional<AuthenticatedUser> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof AuthenticatedUser user) {
            return Optional.of(user);
        }
        return Optional.empty();
    }

    public Optional<UUID> getCurrentUserId() {
        return getCurrentUser().map(AuthenticatedUser::userId);
    }

    public String getCurrentDisplayName() {
        return getCurrentUser()
                .map(AuthenticatedUser::displayName)
                .filter(name -> name != null && !name.isBlank())
                .orElse("User");
    }
}
