package com.meetup.contextservice.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GatewayHeaderAuthenticationFilterTest {

    private GatewayHeaderAuthenticationFilter filter;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        filter = new GatewayHeaderAuthenticationFilter();
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilterInternal_WithValidHeaders_SetsAuthentication() throws ServletException, IOException {
        UUID userId = UUID.randomUUID();
        UUID tweenId = UUID.randomUUID();
        
        when(request.getHeader("X-User-Id")).thenReturn(userId.toString());
        when(request.getHeader("X-User-Email")).thenReturn("test@example.com");
        when(request.getHeader("X-User-Roles")).thenReturn("member,admin");
        when(request.getHeader("X-User-TweenIds")).thenReturn(tweenId.toString());

        filter.doFilter(request, response, filterChain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        AuthenticatedUser user = (AuthenticatedUser) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        assertEquals(userId, user.getId());
        assertEquals("test@example.com", user.getEmail());
        assertTrue(user.getTweenIds().contains(tweenId));
        assertEquals(2, user.getAuthorities().size());
        
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void doFilterInternal_WithMissingHeaders_DoesNotSetAuthentication() throws ServletException, IOException {
        when(request.getHeader("X-User-Id")).thenReturn(null);

        filter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }
}
