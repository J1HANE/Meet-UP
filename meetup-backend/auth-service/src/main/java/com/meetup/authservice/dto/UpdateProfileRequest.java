package com.meetup.authservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    private String displayName;
    private String bio;
    private String location;
    private String recoveryEmail;
    private String avatarUrl;
    private String phone;
    private List<String> topics;

    // Preferences
    private Boolean meetingReminders;
    private Boolean taskDigest;
    private Boolean profileVisibility;
}
