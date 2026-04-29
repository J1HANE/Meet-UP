package com.meetup.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private UUID id;
    private String email;
    private String displayName;
    private List<String> roles;
    private List<UUID> tweenIds;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;
    private String bio;
    private String location;
    private String recoveryEmail;
    private String avatarUrl;
    private String phone;
    private List<String> topics;

    // Preferences
    private boolean meetingReminders;
    private boolean taskDigest;
    private boolean profileVisibility;

    // 2FA
    private boolean twoFactorEnabled;
}
