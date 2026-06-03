package com.meetup.authservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String displayName;

    @Builder.Default
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role")
    @org.hibernate.annotations.BatchSize(size = 20)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<String> roles = new java.util.ArrayList<>();

    @Builder.Default
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "user_tweens", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "tween_id")
    @org.hibernate.annotations.BatchSize(size = 20)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<UUID> tweenIds = new java.util.ArrayList<>();

    @Column(nullable = false)
    private boolean active;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column
    private LocalDateTime lastLoginAt;

    @Column(length = 1000)
    private String bio;

    @Column
    private String location;

    @Column
    private String recoveryEmail;

    @Column
    private String avatarUrl;

    @Column
    private String phone;

    @Builder.Default
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "user_topics", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "topic")
    @org.hibernate.annotations.BatchSize(size = 20)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<String> topics = new java.util.ArrayList<>();

    // Preferences
    @Builder.Default
    @Column(nullable = false)
    private boolean meetingReminders = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean taskDigest = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean profileVisibility = false;

    // 2FA
    @Builder.Default
    @Column
    private boolean twoFactorEnabled = false;

    @Column
    private String twoFactorSecret;

    // Email Verification
    @Builder.Default
    @Column
    private boolean emailVerified = false;

    @Column
    private LocalDateTime emailVerifiedAt;
}
