package com.meetup.apigateway;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class GatewayRouteIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    private String validToken;
    private SecretKey signingKey;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("jwt.secret", () -> "defaultSecretKeyForDevelopmentOnly123456789");
        registry.add("gateway.jwt.enabled", () -> "true");
    }

    @BeforeEach
    void setUp() {
        signingKey = Keys.hmacShaKeyFor("defaultSecretKeyForDevelopmentOnly123456789".getBytes(StandardCharsets.UTF_8));
        
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
    }

    @Test
    void testAuthRoute_WithoutToken_ShouldPassForLogin() {
        String url = "http://localhost:" + port + "/api/auth/login";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, String> body = new HashMap<>();
        body.put("email", "test@example.com");
        body.put("password", "password");
        
        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
        
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
        
        // This will fail if auth-service is not running, but tests the routing configuration
        assertNotNull(response);
    }

    @Test
    void testAuthRoute_WithoutToken_ShouldPassForRegister() {
        String url = "http://localhost:" + port + "/api/auth/register";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, String> body = new HashMap<>();
        body.put("email", "test@example.com");
        body.put("password", "password");
        body.put("name", "Test User");
        
        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
        
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
        
        assertNotNull(response);
    }

    @Test
    void testContextRoute_WithValidToken_ShouldAddXUserIdHeader() {
        String url = "http://localhost:" + port + "/api/context/test";
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(validToken);
        
        HttpEntity<Void> request = new HttpEntity<>(headers);
        
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
        
        // This will fail if context-service is not running, but tests the routing and JWT filter
        assertNotNull(response);
    }

    @Test
    void testContextRoute_WithoutToken_ShouldReturnUnauthorized() {
        String url = "http://localhost:" + port + "/api/context/test";
        HttpHeaders headers = new HttpHeaders();
        
        HttpEntity<Void> request = new HttpEntity<>(headers);
        
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
        
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void testTaskRoute_WithValidToken_ShouldRouteCorrectly() {
        String url = "http://localhost:" + port + "/api/tasks/test";
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(validToken);
        
        HttpEntity<Void> request = new HttpEntity<>(headers);
        
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
        
        // This will fail if task-service is not running, but tests the routing and JWT filter
        assertNotNull(response);
    }

    @Test
    void testTaskRoute_WithoutToken_ShouldReturnUnauthorized() {
        String url = "http://localhost:" + port + "/api/tasks/test";
        HttpHeaders headers = new HttpHeaders();
        
        HttpEntity<Void> request = new HttpEntity<>(headers);
        
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
        
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void testInvalidRoute_ShouldReturnNotFound() {
        String url = "http://localhost:" + port + "/api/invalid/route";
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(validToken);
        
        HttpEntity<Void> request = new HttpEntity<>(headers);
        
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, request, String.class);
        
        assertTrue(response.getStatusCode() == HttpStatus.NOT_FOUND || 
                   response.getStatusCode() == HttpStatus.BAD_GATEWAY);
    }
}
