package com.meetup.authservice.controller;

import com.meetup.authservice.dto.AuthResponse;
import com.meetup.authservice.dto.ChangePasswordRequest;
import com.meetup.authservice.dto.LoginRequest;
import com.meetup.authservice.dto.RefreshRequest;
import com.meetup.authservice.dto.RegisterRequest;
import com.meetup.authservice.dto.UpdateProfileRequest;
import com.meetup.authservice.dto.UpdateRolesRequest;
import com.meetup.authservice.dto.UserResponse;
import com.meetup.authservice.security.UserDetailsImpl;
import com.meetup.authservice.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@Valid @RequestBody RefreshRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(authService.getCurrentUser(userDetails.getEmail()));
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    @PatchMapping("/users/{userId}/roles")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<UserResponse> updateUserRoles(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateRolesRequest request) {
        return ResponseEntity.ok(authService.updateUserRoles(userId, request));
    }

    @PatchMapping("/me")
    public ResponseEntity<UserResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(authService.updateProfile(userDetails.getEmail(), request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        authService.changePassword(userDetails.getEmail(), request);
        return ResponseEntity.ok().build();
    }
}
