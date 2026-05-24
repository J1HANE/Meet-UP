package com.meetup.meetingservice.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * Dev-only: treat {@code X-User-Id} / {@code X-User-Name} as the connected user (no auth-service).
 */
@Component
@ConditionalOnProperty(name = "meeting.dev.impersonation", havingValue = "true")
public class DevUserAuthenticationFilter extends OncePerRequestFilter {

    public static final String USER_ID_HEADER = "X-User-Id";
    public static final String USER_NAME_HEADER = "X-User-Name";

    private final UUID defaultUserId;
    private final String defaultUserName;

    public DevUserAuthenticationFilter(
            @Value("${meeting.dev.default-user-id:11111111-1111-1111-1111-111111111111}") UUID defaultUserId,
            @Value("${meeting.dev.default-user-name:Meeting Host}") String defaultUserName
    ) {
        this.defaultUserId = defaultUserId;
        this.defaultUserName = defaultUserName;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (SecurityContextHolder.getContext().getAuthentication() == null
                || !SecurityContextHolder.getContext().getAuthentication().isAuthenticated()) {
            UUID userId = resolveUserId(request);
            String displayName = resolveDisplayName(request);
            AuthenticatedUser user = new AuthenticatedUser(userId, null, displayName, List.of("USER"), List.of());
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    user,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_USER"))
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        filterChain.doFilter(request, response);
    }

    private UUID resolveUserId(HttpServletRequest request) {
        String header = request.getHeader(USER_ID_HEADER);
        if (StringUtils.hasText(header)) {
            return UUID.fromString(header.trim());
        }
        return defaultUserId;
    }

    private String resolveDisplayName(HttpServletRequest request) {
        String header = request.getHeader(USER_NAME_HEADER);
        if (StringUtils.hasText(header)) {
            return header.trim();
        }
        return defaultUserName;
    }
}
