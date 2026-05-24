package com.meetup.authservice.service;

import com.meetup.authservice.dto.*;
import com.meetup.authservice.exception.*;
import com.meetup.authservice.model.EmailVerificationToken;
import com.meetup.authservice.model.PasswordResetToken;
import com.meetup.authservice.model.RefreshToken;
import com.meetup.authservice.model.User;
import com.meetup.authservice.repository.EmailVerificationTokenRepository;
import com.meetup.authservice.repository.PasswordResetTokenRepository;
import com.meetup.authservice.repository.RefreshTokenRepository;
import com.meetup.authservice.repository.UserRepository;
import com.meetup.authservice.security.JwtUtil;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.apache.commons.codec.binary.Base32;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final JavaMailSender mailSender;

    @Value("${app.email.frontend-url}")
    private String frontendUrl;

    @Value("${app.email.from}")
    private String emailFrom;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("User already exists with email: " + request.getEmail());
        }

        List<String> roles = request.getRoles() != null && !request.getRoles().isEmpty() 
                ? new java.util.ArrayList<>(request.getRoles()) 
                : new java.util.ArrayList<>(List.of("member"));

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .displayName(request.getDisplayName())
                .roles(roles)
                .active(true)
                .build();

        user = userRepository.save(user);

        String accessToken = jwtUtil.generateAccessToken(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRoles(),
                user.getTweenIds()
        );

        String refreshToken = createRefreshToken(user.getId());

        sendEmailVerification(user);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        user.setLastLoginAt(java.time.LocalDateTime.now());
        user = userRepository.save(user);

        String accessToken = jwtUtil.generateAccessToken(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRoles(),
                user.getTweenIds()
        );

        revokeAllUserRefreshTokens(user.getId());
        String refreshToken = createRefreshToken(user.getId());

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new TokenRefreshException("Invalid refresh token"));
        token.setRevoked(true);
        refreshTokenRepository.save(token);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new TokenRefreshException("Refresh token not found"));

        if (refreshToken.isRevoked()) {
            throw new TokenRefreshException("Refresh token has been revoked");
        }

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new TokenRefreshException("Refresh token has expired");
        }

        UUID userId = jwtUtil.extractUserId(refreshToken.getToken());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        String newAccessToken = jwtUtil.generateAccessToken(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRoles(),
                user.getTweenIds()
        );

        return buildAuthResponse(user, newAccessToken, refreshToken.getToken());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(email));
        return mapToUserResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUserFromPrincipal(UUID userId, String email, String displayName, List<String> roles, List<UUID> tweenIds, List<String> topics) {
        return UserResponse.builder()
                .id(userId)
                .email(email)
                .displayName(displayName)
                .roles(roles != null ? roles : new java.util.ArrayList<>())
                .tweenIds(tweenIds != null ? tweenIds : new java.util.ArrayList<>())
                .topics(topics != null ? topics : new java.util.ArrayList<>())
                .active(true)
                .meetingReminders(true)
                .taskDigest(true)
                .profileVisibility(false)
                .twoFactorEnabled(false)
                .emailVerified(false)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .toList();
    }

    @Override
    @Transactional
    public UserResponse updateUserRoles(UUID userId, UpdateRolesRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        user.setRoles(request.getRoles());
        user = userRepository.save(user);

        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(email));

        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getLocation() != null) {
            user.setLocation(request.getLocation());
        }
        if (request.getRecoveryEmail() != null) {
            user.setRecoveryEmail(request.getRecoveryEmail());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getTopics() != null) {
            user.setTopics(request.getTopics());
        }
        if (request.getMeetingReminders() != null) {
            user.setMeetingReminders(request.getMeetingReminders());
        }
        if (request.getTaskDigest() != null) {
            user.setTaskDigest(request.getTaskDigest());
        }
        if (request.getProfileVisibility() != null) {
            user.setProfileVisibility(request.getProfileVisibility());
        }

        user = userRepository.save(user);
        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(email));

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private String createRefreshToken(UUID userId) {
        String token = jwtUtil.generateRefreshToken(userId);
        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .userId(userId)
                .expiryDate(Instant.now().plus(7, ChronoUnit.DAYS))
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);
        return token;
    }

    private void revokeAllUserRefreshTokens(UUID userId) {
        List<RefreshToken> tokens = refreshTokenRepository.findByUserIdAndRevokedFalse(userId);
        tokens.forEach(token -> token.setRevoked(true));
        refreshTokenRepository.saveAll(tokens);
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getAccessTokenExpiration())
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .displayName(user.getDisplayName())
                        .roles(user.getRoles())
                        .build())
                .build();
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .roles(user.getRoles() != null ? user.getRoles() : new java.util.ArrayList<>())
                .tweenIds(user.getTweenIds() != null ? user.getTweenIds() : new java.util.ArrayList<>())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .bio(user.getBio())
                .location(user.getLocation())
                .recoveryEmail(user.getRecoveryEmail())
                .avatarUrl(user.getAvatarUrl())
                .phone(user.getPhone())
                .topics(user.getTopics() != null ? user.getTopics() : new java.util.ArrayList<>())
                .meetingReminders(user.isMeetingReminders())
                .taskDigest(user.isTaskDigest())
                .profileVisibility(user.isProfileVisibility())
                .twoFactorEnabled(user.isTwoFactorEnabled())
                .emailVerified(user.isEmailVerified())
                .build();
    }

    @Override
    @Transactional
    public String sendEmailVerification(User user) {

        // Delete existing unverified tokens for this email
        emailVerificationTokenRepository.deleteByEmail(user.getEmail());

        // Generate new verification token
        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .token(token)
                .email(user.getEmail())
                .expiryDate(LocalDateTime.now().plus(24, java.time.temporal.ChronoUnit.HOURS))
                .verified(false)
                .usedAt(null)
                .build();

        emailVerificationTokenRepository.save(verificationToken);

        // Send email with verification link
        try {
            String verificationUrl = frontendUrl + "/verify-email?token=" + token;
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(emailFrom);
            helper.setTo(user.getEmail());
            helper.setSubject("Verify your Meet-Up account");
            helper.setText(
                "<html><body>" +
                "<h2>Welcome to Meet-Up!</h2>" +
                "<p>Please verify your email address by clicking the link below:</p>" +
                "<p><a href=\"" + verificationUrl + "\">Verify Email</a></p>" +
                "<p>Or copy and paste this link into your browser:</p>" +
                "<p>" + verificationUrl + "</p>" +
                "<p>This link will expire in 24 hours.</p>" +
                "</body></html>",
                true
            );
            mailSender.send(message);
        } catch (Exception e) {
            // Log error but don't fail - token is still valid for testing
            System.err.println("Failed to send email: " + e.getMessage());
        }

        // Return token for testing purposes
        return token;
    }

    @Override
    @Transactional
    public void verifyEmail(VerifyEmailRequest request) {
        try {
            EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByToken(request.getToken())
                    .orElseThrow(() -> new RuntimeException("Invalid verification token"));

            if (verificationToken.isVerified()) {
                throw new RuntimeException("Email already verified");
            }

            if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Verification token has expired");
            }

            // Mark token as verified
            verificationToken.setVerified(true);
            verificationToken.setUsedAt(LocalDateTime.now());
            emailVerificationTokenRepository.save(verificationToken);

            // Update user email verification status
            User user = userRepository.findByEmail(verificationToken.getEmail())
                    .orElseThrow(() -> new UserNotFoundException(verificationToken.getEmail()));

            user.setEmailVerified(true);
            user.setEmailVerifiedAt(LocalDateTime.now());
            userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Email verification failed: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public String requestPasswordReset(RequestPasswordResetRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException(request.getEmail()));

        // Delete existing unused tokens for this email
        passwordResetTokenRepository.deleteByEmail(request.getEmail());

        // Generate new reset token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .email(request.getEmail())
                .expiryDate(LocalDateTime.now().plus(1, java.time.temporal.ChronoUnit.HOURS))
                .used(false)
                .usedAt(null)
                .build();

        passwordResetTokenRepository.save(resetToken);

        // Send email with reset link
        try {
            String resetUrl = frontendUrl + "/reset-password?token=" + token;
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(emailFrom);
            helper.setTo(request.getEmail());
            helper.setSubject("Reset your Meet-Up password");
            helper.setText(
                "<html><body>" +
                "<h2>Password Reset Request</h2>" +
                "<p>You requested a password reset for your Meet-Up account.</p>" +
                "<p>Click the link below to reset your password:</p>" +
                "<p><a href=\"" + resetUrl + "\">Reset Password</a></p>" +
                "<p>Or copy and paste this link into your browser:</p>" +
                "<p>" + resetUrl + "</p>" +
                "<p>This link will expire in 1 hour.</p>" +
                "<p>If you didn't request this, please ignore this email.</p>" +
                "</body></html>",
                true
            );
            mailSender.send(message);
        } catch (Exception e) {
            // Log error but don't fail - token is still valid for testing
            System.err.println("Failed to send email: " + e.getMessage());
        }

        // Return token for testing purposes
        return token;
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (resetToken.isUsed()) {
            throw new RuntimeException("Reset token already used");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }

        // Mark token as used
        resetToken.setUsed(true);
        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);

        // Update user password
        User user = userRepository.findByEmail(resetToken.getEmail())
                .orElseThrow(() -> new UserNotFoundException(resetToken.getEmail()));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public Setup2FAResponse setup2FA(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(email));

        if (user.isTwoFactorEnabled()) {
            throw new RuntimeException("2FA is already enabled for this account");
        }

        // Generate a random secret key using Google Authenticator
        GoogleAuthenticator gAuth = new GoogleAuthenticator();
        GoogleAuthenticatorKey key = gAuth.createCredentials();
        String secret = key.getKey();

        // Store the secret temporarily (not enabled yet)
        user.setTwoFactorSecret(secret);
        userRepository.save(user);

        // Generate QR code URL
        String qrCodeUrl = String.format(
            "otpauth://totp/Meet-Up:%s?secret=%s&issuer=Meet-Up",
            email,
            secret
        );

        return Setup2FAResponse.builder()
                .secret(secret)
                .qrCodeUrl(qrCodeUrl)
                .build();
    }

    @Override
    @Transactional
    public void enable2FA(String email, Enable2FARequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(email));

        if (user.isTwoFactorEnabled()) {
            throw new RuntimeException("2FA is already enabled for this account");
        }

        if (user.getTwoFactorSecret() == null) {
            throw new RuntimeException("2FA setup not initiated. Please call setup2FA first.");
        }

        // Verify the code (simplified - in production, use a proper TOTP library)
        if (!verifyTOTP(user.getTwoFactorSecret(), request.getVerificationCode())) {
            throw new RuntimeException("Invalid verification code");
        }

        // Enable 2FA
        user.setTwoFactorEnabled(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void disable2FA(String email, Disable2FARequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(email));

        if (!user.isTwoFactorEnabled()) {
            throw new RuntimeException("2FA is not enabled for this account");
        }

        // Verify the code before disabling
        if (!verifyTOTP(user.getTwoFactorSecret(), request.getVerificationCode())) {
            throw new RuntimeException("Invalid verification code");
        }

        // Disable 2FA
        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        userRepository.save(user);
    }

    private boolean verifyTOTP(String secret, String code) {
        try {
            GoogleAuthenticator gAuth = new GoogleAuthenticator();
            int codeInt = Integer.parseInt(code);
            return gAuth.authorize(secret, codeInt);
        } catch (NumberFormatException e) {
            return false;
        }
    }

    @Override
    @Transactional
    public void deleteAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(email));

        // Delete all refresh tokens for this user
        refreshTokenRepository.deleteByUserId(user.getId());

        // Delete email verification tokens
        emailVerificationTokenRepository.deleteByEmail(email);

        // Delete password reset tokens
        passwordResetTokenRepository.deleteByEmail(email);

        // Delete the user
        userRepository.delete(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> searchUsers(String query, int limit, int offset) {
        return userRepository.findAll().stream()
                .filter(user -> {
                    String lowerQuery = query.toLowerCase();
                    return user.getEmail().toLowerCase().contains(lowerQuery)
                            || user.getDisplayName().toLowerCase().contains(lowerQuery)
                            || (user.getBio() != null && user.getBio().toLowerCase().contains(lowerQuery))
                            || (user.getLocation() != null && user.getLocation().toLowerCase().contains(lowerQuery));
                })
                .skip(offset)
                .limit(limit)
                .map(this::mapToUserResponse)
                .collect(java.util.stream.Collectors.toList());
    }
}
