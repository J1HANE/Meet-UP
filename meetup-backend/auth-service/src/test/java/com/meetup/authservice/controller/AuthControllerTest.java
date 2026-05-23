package com.meetup.authservice.controller;

import com.meetup.authservice.dto.*;
import com.meetup.authservice.security.UserDetailsImpl;
import com.meetup.authservice.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    private AuthResponse authResponse;
    private UserResponse userResponse;

    @BeforeEach
    void setUp() {
        authResponse = AuthResponse.builder()
                .accessToken("test-access-token")
                .refreshToken("test-refresh-token")
                .tokenType("Bearer")
                .expiresIn(900L)
                .user(AuthResponse.UserInfo.builder()
                        .id(UUID.randomUUID())
                        .email("test@example.com")
                        .displayName("Test User")
                        .roles(List.of("member"))
                        .build())
                .build();

        userResponse = UserResponse.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .displayName("Test User")
                .roles(List.of("member"))
                .tweenIds(List.of(UUID.randomUUID()))
                .active(true)
                .build();
    }

    @Test
    void testRegister_Success() {
        RegisterRequest request = RegisterRequest.builder()
                .email("test@example.com")
                .password("password123")
                .displayName("Test User")
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

        ResponseEntity<AuthResponse> response = authController.register(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("test-access-token", response.getBody().getAccessToken());
        assertEquals("test@example.com", response.getBody().getUser().getEmail());
        verify(authService).register(any(RegisterRequest.class));
    }

    @Test
    void testLogin_Success() {
        LoginRequest request = LoginRequest.builder()
                .email("test@example.com")
                .password("password123")
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        ResponseEntity<AuthResponse> response = authController.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("test-access-token", response.getBody().getAccessToken());
        assertEquals("test-refresh-token", response.getBody().getRefreshToken());
        verify(authService).login(any(LoginRequest.class));
    }

    @Test
    void testLogout_Success() {
        RefreshRequest request = RefreshRequest.builder()
                .refreshToken("test-refresh-token")
                .build();

        ResponseEntity<Void> response = authController.logout(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(authService).logout("test-refresh-token");
    }

    @Test
    void testRefreshToken_Success() {
        RefreshRequest request = RefreshRequest.builder()
                .refreshToken("test-refresh-token")
                .build();

        when(authService.refreshToken(any(RefreshRequest.class))).thenReturn(authResponse);

        ResponseEntity<AuthResponse> response = authController.refreshToken(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("test-access-token", response.getBody().getAccessToken());
        verify(authService).refreshToken(any(RefreshRequest.class));
    }

    @Test
    void testGetCurrentUser_Success() {
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .email("test@example.com")
                .password("password")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_member")))
                .build();

        UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        when(authService.getCurrentUser(anyString())).thenReturn(userResponse);

        ResponseEntity<UserResponse> response = authController.getCurrentUser(authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("test@example.com", response.getBody().getEmail());
        assertEquals("Test User", response.getBody().getDisplayName());
        verify(authService).getCurrentUser("test@example.com");
        
        SecurityContextHolder.clearContext();
    }

    @Test
    void testUpdateProfile_Success() {
        UpdateProfileRequest request = UpdateProfileRequest.builder()
                .displayName("Updated Name")
                .bio("Updated bio")
                .build();

        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .email("test@example.com")
                .password("password")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_member")))
                .build();

        UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        when(authService.updateProfile(anyString(), any(UpdateProfileRequest.class))).thenReturn(userResponse);

        ResponseEntity<UserResponse> response = authController.updateProfile(authentication, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Test User", response.getBody().getDisplayName());
        verify(authService).updateProfile(eq("test@example.com"), any(UpdateProfileRequest.class));
        
        SecurityContextHolder.clearContext();
    }

    @Test
    void testChangePassword_Success() {
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("oldPassword")
                .newPassword("newPassword123")
                .build();

        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .email("test@example.com")
                .password("password")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_member")))
                .build();

        UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        ResponseEntity<Void> response = authController.changePassword(authentication, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(authService).changePassword(eq("test@example.com"), any(ChangePasswordRequest.class));
        
        SecurityContextHolder.clearContext();
    }

    @Test
    void testGetAllUsers_Admin_Success() {
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .email("admin@example.com")
                .password("password")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_admin")))
                .build();

        UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        when(authService.getAllUsers()).thenReturn(List.of(userResponse));

        ResponseEntity<List<UserResponse>> response = authController.getAllUsers();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        verify(authService).getAllUsers();
        
        SecurityContextHolder.clearContext();
    }

    @Test
    void testUpdateUserRoles_Admin_Success() {
        UUID userId = UUID.randomUUID();
        UpdateRolesRequest request = UpdateRolesRequest.builder()
                .roles(List.of("admin", "member"))
                .build();

        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .email("admin@example.com")
                .password("password")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_admin")))
                .build();

        UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        when(authService.updateUserRoles(any(UUID.class), any(UpdateRolesRequest.class))).thenReturn(userResponse);

        ResponseEntity<UserResponse> response = authController.updateUserRoles(userId, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(authService).updateUserRoles(eq(userId), any(UpdateRolesRequest.class));
        
        SecurityContextHolder.clearContext();
    }

    @Test
    void testVerifyEmail_Success() {
        VerifyEmailRequest request = VerifyEmailRequest.builder()
                .token("verification-token")
                .build();

        ResponseEntity<Void> response = authController.verifyEmail(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(authService).verifyEmail(request);
    }

    @Test
    void testRequestPasswordReset_Success() {
        RequestPasswordResetRequest request = RequestPasswordResetRequest.builder()
                .email("test@example.com")
                .build();

        when(authService.requestPasswordReset(any(RequestPasswordResetRequest.class)))
                .thenReturn("reset-token");

        ResponseEntity<Map<String, String>> response = authController.requestPasswordReset(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("reset-token", response.getBody().get("token"));
        verify(authService).requestPasswordReset(any(RequestPasswordResetRequest.class));
    }

    @Test
    void testResetPassword_Success() {
        ResetPasswordRequest request = ResetPasswordRequest.builder()
                .token("reset-token")
                .newPassword("newPassword123")
                .build();

        ResponseEntity<Void> response = authController.resetPassword(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(authService).resetPassword(request);
    }

    @Test
    void testSetup2FA_Success() {
        Setup2FAResponse response = Setup2FAResponse.builder()
                .secret("secret-key")
                .qrCodeUrl("https://example.com/qr")
                .build();

        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .email("test@example.com")
                .password("password")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_member")))
                .build();

        UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        when(authService.setup2FA(anyString())).thenReturn(response);

        ResponseEntity<Setup2FAResponse> authResponse = authController.setup2FA(authentication);

        assertEquals(HttpStatus.OK, authResponse.getStatusCode());
        assertEquals("secret-key", authResponse.getBody().getSecret());
        verify(authService).setup2FA("test@example.com");
        
        SecurityContextHolder.clearContext();
    }

    @Test
    void testEnable2FA_Success() {
        Enable2FARequest request = Enable2FARequest.builder()
                .verificationCode("123456")
                .build();

        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .email("test@example.com")
                .password("password")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_member")))
                .build();

        UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        ResponseEntity<Void> response = authController.enable2FA(authentication, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(authService).enable2FA(eq("test@example.com"), any(Enable2FARequest.class));
        
        SecurityContextHolder.clearContext();
    }

    @Test
    void testDisable2FA_Success() {
        Disable2FARequest request = Disable2FARequest.builder()
                .verificationCode("123456")
                .build();

        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .email("test@example.com")
                .password("password")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_member")))
                .build();

        UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        ResponseEntity<Void> response = authController.disable2FA(authentication, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(authService).disable2FA(eq("test@example.com"), any(Disable2FARequest.class));
        
        SecurityContextHolder.clearContext();
    }

    @Test
    void testDeleteAccount_Success() {
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .email("test@example.com")
                .password("password")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_member")))
                .build();

        UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        ResponseEntity<Void> response = authController.deleteAccount(authentication);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(authService).deleteAccount("test@example.com");
        
        SecurityContextHolder.clearContext();
    }

    @Test
    void testSearchUsers_Admin_Success() {
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .email("admin@example.com")
                .password("password")
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_admin")))
                .build();

        UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        when(authService.searchUsers(anyString(), anyInt(), anyInt())).thenReturn(List.of(userResponse));

        ResponseEntity<List<UserResponse>> response = authController.searchUsers("test", 10, 0);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        verify(authService).searchUsers("test", 10, 0);
        
        SecurityContextHolder.clearContext();
    }
}
