package com.meetup.authservice.service;

import com.meetup.authservice.dto.AuthResponse;
import com.meetup.authservice.dto.ChangePasswordRequest;
import com.meetup.authservice.dto.LoginRequest;
import com.meetup.authservice.dto.RefreshRequest;
import com.meetup.authservice.dto.RegisterRequest;
import com.meetup.authservice.dto.UpdateProfileRequest;
import com.meetup.authservice.dto.UpdateRolesRequest;
import com.meetup.authservice.dto.UserResponse;

import java.util.List;
import java.util.UUID;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    void logout(String refreshToken);

    AuthResponse refreshToken(RefreshRequest request);

    UserResponse getCurrentUser(String email);

    List<UserResponse> getAllUsers();

    UserResponse updateUserRoles(UUID userId, UpdateRolesRequest request);

    UserResponse updateProfile(String email, UpdateProfileRequest request);

    void changePassword(String email, ChangePasswordRequest request);
}
