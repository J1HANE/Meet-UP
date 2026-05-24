package com.meetup.meetingservice.integration;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

/**
 * Generates Stream Chat / Video user JWTs signed with the Stream API secret.
 * @see <a href="https://getstream.io/chat/docs/java/tokens_and_authentication/">Stream tokens</a>
 */
@Component
public class StreamTokenGenerator {

    private final SecretKey signingKey;

    public StreamTokenGenerator(@Value("${stream.api-secret}") String apiSecret) {
        this.signingKey = Keys.hmacShaKeyFor(apiSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String createUserToken(String userId) {
        Instant now = Instant.now();
        Date issuedAt = Date.from(now);
        Date expiration = Date.from(now.plusSeconds(3600));

        return Jwts.builder()
                .subject(userId)
                .claim("user_id", userId)
                .issuedAt(issuedAt)
                .expiration(expiration)
                .signWith(signingKey, Jwts.SIG.HS256)
                .compact();
    }
}
