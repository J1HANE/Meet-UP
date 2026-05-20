package com.meetup.contextservice.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
public class GatewayHeaderAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String userId = request.getHeader("X-User-Id");
        String userEmail = request.getHeader("X-User-Email");
        String userRoles = request.getHeader("X-User-Roles");
        String userTweenIds = request.getHeader("X-User-TweenIds");

        if (userId != null && userEmail != null) {
            try {
                List<SimpleGrantedAuthority> authorities = userRoles != null ?
                        Arrays.stream(userRoles.split(","))
                                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.trim().toUpperCase()))
                                .collect(Collectors.toList()) :
                        List.of();

                List<UUID> tweenIds = userTweenIds != null && !userTweenIds.isEmpty() ?
                        Arrays.stream(userTweenIds.split(","))
                                .map(String::trim)
                                .map(UUID::fromString)
                                .collect(Collectors.toList()) :
                        List.of();

                AuthenticatedUser authenticatedUser = new AuthenticatedUser(
                        UUID.fromString(userId),
                        userEmail,
                        authorities,
                        tweenIds
                );

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        authenticatedUser, null, authorities);

                SecurityContext context = SecurityContextHolder.createEmptyContext();
                context.setAuthentication(authentication);
                SecurityContextHolder.setContext(context);
                
                log.debug("Authenticated user {} from gateway headers", userEmail);
            } catch (Exception e) {
                log.error("Failed to parse gateway headers: {}", e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
