package com.meetup.apigateway.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    @Value("${jwt.secret:defaultSecretKeyForDevelopmentOnly123456789}")
    private String secret;

    @Value("${gateway.jwt.enabled:true}")
    private boolean jwtEnabled;

    private static final List<String> EXCLUDED_PATHS = List.of(
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh",
            "/api/auth/verify-email",
            "/api/auth/request-password-reset",
            "/api/auth/reset-password",
            // Meeting-service enforces auth when meeting.security.require-auth=true
            "/api/meetings",
            "/actuator/health",
            "/actuator/info"
    );

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().value();

        // Skip JWT validation for excluded paths
        if (shouldSkipPath(path) || !jwtEnabled) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Missing or invalid Authorization header for path: {}", path);
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        String token = authHeader.substring(7);

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String userId = claims.get("userId", String.class);
            String tokenType = claims.get("type", String.class);

            // Validate it's an access token
            if (!"access".equals(tokenType)) {
                log.warn("Invalid token type: {} for path: {}", tokenType, path);
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            String email = claims.get("email", String.class);

            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) claims.get("roles");
            String rolesHeader = roles != null ? String.join(",", roles) : "";

            @SuppressWarnings("unchecked")
            List<String> tweenIds = (List<String>) claims.get("tweenIds");
            String tweenIdsHeader = tweenIds != null ? String.join(",", tweenIds) : "";

            // Forward all user claims to downstream services (keep original Authorization header)
            ServerWebExchange mutatedExchange = exchange.mutate()
                    .request(r -> r
                            .header("X-User-Id", userId)
                            .header("X-User-Email", email != null ? email : "")
                            .header("X-User-Roles", rolesHeader)
                            .header("X-User-TweenIds", tweenIdsHeader)
                            .header(HttpHeaders.AUTHORIZATION, authHeader))
                    .build();

            log.debug("JWT validated successfully for user: {} on path: {}", userId, path);
            return chain.filter(mutatedExchange);

        } catch (Exception e) {
            log.error("JWT validation failed for path: {}", path, e);
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }

    private boolean shouldSkipPath(String path) {
        return EXCLUDED_PATHS.stream().anyMatch(path::startsWith);
    }

    @Override
    public int getOrder() {
        return -100; // High priority to run before other filters
    }
}
