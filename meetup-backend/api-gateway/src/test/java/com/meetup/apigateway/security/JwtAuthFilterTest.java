package com.meetup.apigateway.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthFilterTest {

    @InjectMocks
    private JwtAuthFilter jwtAuthFilter;

    @Mock
    private GatewayFilterChain chain;

    private String validToken;
    private String invalidToken;
    private String refreshToken;
    private SecretKey signingKey;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtAuthFilter, "secret", "defaultSecretKeyForDevelopmentOnly123456789");
        ReflectionTestUtils.setField(jwtAuthFilter, "jwtEnabled", true);

        signingKey = Keys.hmacShaKeyFor("defaultSecretKeyForDevelopmentOnly123456789".getBytes(StandardCharsets.UTF_8));
        
        // Generate valid access token
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", UUID.randomUUID().toString());
        claims.put("type", "access");
        
        validToken = Jwts.builder()
                .claims(claims)
                .subject("test@example.com")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(signingKey)
                .compact();

        // Generate invalid token (wrong signature)
        invalidToken = "invalid.token.here";

        // Generate refresh token (should be rejected)
        Map<String, Object> refreshClaims = new HashMap<>();
        refreshClaims.put("userId", UUID.randomUUID().toString());
        refreshClaims.put("type", "refresh");
        
        refreshToken = Jwts.builder()
                .claims(refreshClaims)
                .subject("test@example.com")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(signingKey)
                .compact();
    }

    @Test
    void testValidToken_ShouldPassThrough() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/context/test")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(chain.filter(any(ServerWebExchange.class))).thenReturn(Mono.empty());

        jwtAuthFilter.filter(exchange, chain).block();

        verify(chain, times(1)).filter(any(ServerWebExchange.class));
    }

    @Test
    void testMissingAuthorizationHeader_ShouldReturnUnauthorized() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/context/test").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        jwtAuthFilter.filter(exchange, chain).block();

        verify(chain, never()).filter(any(ServerWebExchange.class));
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
    }

    @Test
    void testInvalidAuthorizationHeaderFormat_ShouldReturnUnauthorized() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/context/test")
                .header(HttpHeaders.AUTHORIZATION, "InvalidFormat " + validToken)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        jwtAuthFilter.filter(exchange, chain).block();

        verify(chain, never()).filter(any(ServerWebExchange.class));
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
    }

    @Test
    void testInvalidToken_ShouldReturnUnauthorized() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/context/test")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + invalidToken)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        jwtAuthFilter.filter(exchange, chain).block();

        verify(chain, never()).filter(any(ServerWebExchange.class));
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
    }

    @Test
    void testRefreshToken_ShouldReturnUnauthorized() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/context/test")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + refreshToken)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        jwtAuthFilter.filter(exchange, chain).block();

        verify(chain, never()).filter(any(ServerWebExchange.class));
        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
    }

    @Test
    void testExcludedPath_Login_ShouldSkipValidation() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/auth/login").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(chain.filter(any(ServerWebExchange.class))).thenReturn(Mono.empty());

        jwtAuthFilter.filter(exchange, chain).block();

        verify(chain, times(1)).filter(any(ServerWebExchange.class));
    }

    @Test
    void testExcludedPath_Register_ShouldSkipValidation() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/auth/register").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(chain.filter(any(ServerWebExchange.class))).thenReturn(Mono.empty());

        jwtAuthFilter.filter(exchange, chain).block();

        verify(chain, times(1)).filter(any(ServerWebExchange.class));
    }

    @Test
    void testExcludedPath_Refresh_ShouldSkipValidation() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/auth/refresh").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(chain.filter(any(ServerWebExchange.class))).thenReturn(Mono.empty());

        jwtAuthFilter.filter(exchange, chain).block();

        verify(chain, times(1)).filter(any(ServerWebExchange.class));
    }

    @Test
    void testValidToken_ShouldAddXUserIdHeader() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/context/test")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + validToken)
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(chain.filter(any(ServerWebExchange.class))).thenAnswer(invocation -> {
            ServerWebExchange capturedExchange = invocation.getArgument(0);
            String userIdHeader = capturedExchange.getRequest().getHeaders().getFirst("X-User-Id");
            assertNotNull(userIdHeader);
            return Mono.empty();
        });

        jwtAuthFilter.filter(exchange, chain).block();

        verify(chain, times(1)).filter(any(ServerWebExchange.class));
    }

    @Test
    void testGetOrder_ShouldReturnHighPriority() {
        int order = jwtAuthFilter.getOrder();
        assertTrue(order < 0, "Filter should have high priority (negative order)");
    }
}
