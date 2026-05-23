package com.meetup.authservice.controller;

import com.meetup.authservice.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Key;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/.well-known")
@RequiredArgsConstructor
public class JwksController {

    private final JwtUtil jwtUtil;

    @GetMapping("/jwks.json")
    public Map<String, Object> getJwks() {
        Map<String, Object> jwks = new HashMap<>();
        Map<String, Object> keys = new HashMap<>();
        
        // Get the signing key from JwtUtil
        // Note: Since we're using HMAC, we don't expose the secret key
        // For production with RSA, you would expose the public key here
        // This is a simplified implementation for HMAC-based JWTs
        keys.put("kty", "oct");
        keys.put("alg", "HS256");
        keys.put("use", "sig");
        keys.put("kid", "meetup-key-1");
        
        // For HMAC, we don't expose the actual key in JWKS
        // The secret must be shared out-of-band between services
        keys.put("kty", "oct");
        
        jwks.put("keys", new Object[]{keys});
        return jwks;
    }
    
    @GetMapping("/jwt-config")
    public Map<String, Object> getJwtConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("algorithm", "HS256");
        config.put("keyType", "HMAC");
        config.put("note", "For HMAC-based JWTs, the secret key must be shared via environment variables or configuration");
        config.put("jwksEndpoint", "/.well-known/jwks.json");
        return config;
    }
}
