package com.meetup.authservice.service;

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

import java.util.List;
import java.util.UUID;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    void logout(String refreshToken);

    AuthResponse refreshToken(RefreshRequest request);

    UserResponse getCurrentUser(String email);

    UserResponse getCurrentUserFromPrincipal(UUID userId, String email, String displayName, List<String> roles, List<UUID> tweenIds, List<String> topics);

    List<UserResponse> getAllUsers();

    UserResponse updateUserRoles(UUID userId, UpdateRolesRequest request);

    UserResponse updateProfile(String email, UpdateProfileRequest request);

    void changePassword(String email, ChangePasswordRequest request);

    String sendEmailVerification(User user);

    void verifyEmail(VerifyEmailRequest request);

    String requestPasswordReset(RequestPasswordResetRequest request);

    void resetPassword(ResetPasswordRequest request);

    Setup2FAResponse setup2FA(String email);

    void enable2FA(String email, Enable2FARequest request);

    void disable2FA(String email, Disable2FARequest request);

    void deleteAccount(String email);

    List<UserResponse> searchUsers(String query, int limit, int offset);
}
