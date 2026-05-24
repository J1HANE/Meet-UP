package com.meetup.meetingservice.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Component
public class JwtUtil {

    @Value("${jwt.secret:defaultSecretKeyForDevelopmentOnly12345678901234567890}")
    private String jwtSecret;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            return extractAllClaims(token).getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public UUID extractUserId(Claims claims) {
        String value = claims.get("userId", String.class);
        return value == null ? null : UUID.fromString(value);
    }

    public List<String> extractRoles(Claims claims) {
        Object roles = claims.get("roles");
        if (roles instanceof List<?> roleList) {
            return roleList.stream().map(String::valueOf).toList();
        }
        return Collections.emptyList();
    }

    public List<UUID> extractTweenIds(Claims claims) {
        Object tweenIds = claims.get("tweenIds");
        if (tweenIds instanceof List<?> tweenIdList) {
            return tweenIdList.stream().map(String::valueOf).map(UUID::fromString).toList();
        }
        return Collections.emptyList();
    }
}
