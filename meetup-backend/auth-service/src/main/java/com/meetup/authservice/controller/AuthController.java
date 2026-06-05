package com.meetup.authservice.controller;

import com.meetup.authservice.dto.AuthResponse;
import com.meetup.authservice.dto.ChangePasswordRequest;
import com.meetup.authservice.dto.Disable2FARequest;
import com.meetup.authservice.dto.Enable2FARequest;
import com.meetup.authservice.dto.LoginRequest;
import com.meetup.authservice.dto.RefreshRequest;
import com.meetup.authservice.dto.RegisterRequest;
import com.meetup.authservice.dto.RequestPasswordResetRequest;
import com.meetup.authservice.dto.ResetPasswordRequest;
import com.meetup.authservice.dto.Setup2FAResponse;
import com.meetup.authservice.dto.UpdateProfileRequest;
import com.meetup.authservice.dto.UpdateRolesRequest;
import com.meetup.authservice.dto.UserResponse;
import com.meetup.authservice.dto.VerifyEmailRequest;
import com.meetup.authservice.model.User;
import com.meetup.authservice.repository.UserRepository;
import com.meetup.authservice.security.UserDetailsImpl;
import com.meetup.authservice.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

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
        return ResponseEntity.ok(authService.getCurrentUserFromPrincipal(
                userDetails.getId(),
                userDetails.getEmail(),
                userDetails.getDisplayName(),
                userDetails.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList(),
                userDetails.getTweenIds(),
                userDetails.getTopics()
        ));
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

    @PostMapping("/send-verification-email")
    public ResponseEntity<Map<String, String>> sendVerificationEmail(
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findByEmail(userDetails.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        String token = authService.sendEmailVerification(user);
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/request-password-reset")
    public ResponseEntity<Map<String, String>> requestPasswordReset(@Valid @RequestBody RequestPasswordResetRequest request) {
        String token = authService.requestPasswordReset(request);
        return ResponseEntity.ok(Map.of("token", token));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/2fa/setup")
    public ResponseEntity<Setup2FAResponse> setup2FA(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(authService.setup2FA(userDetails.getEmail()));
    }

    @PostMapping("/2fa/enable")
    public ResponseEntity<Void> enable2FA(
            Authentication authentication,
            @Valid @RequestBody Enable2FARequest request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        authService.enable2FA(userDetails.getEmail(), request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/2fa/disable")
    public ResponseEntity<Void> disable2FA(
            Authentication authentication,
            @Valid @RequestBody Disable2FARequest request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        authService.disable2FA(userDetails.getEmail(), request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteAccount(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        authService.deleteAccount(userDetails.getEmail());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/search")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<List<UserResponse>> searchUsers(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int offset) {
        return ResponseEntity.ok(authService.searchUsers(query, limit, offset));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID userId) {
        return ResponseEntity.ok(authService.getUserById(userId));
    }

    @GetMapping("/users/by-email")
    public ResponseEntity<UserResponse> getUserByEmail(@RequestParam String email) {
        return ResponseEntity.ok(authService.getCurrentUser(email));
    }
}
