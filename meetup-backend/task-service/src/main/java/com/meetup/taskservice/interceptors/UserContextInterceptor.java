package com.meetup.taskservice.interceptors;

import com.meetup.taskservice.domain.entity.UserContext;
import com.meetup.taskservice.domain.entity.UserContextHolder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Arrays;
import java.util.List;

@Component
public class UserContextInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {

        String userId    = request.getHeader("X-User-Id");
        String email     = request.getHeader("X-User-Email");
        String rolesRaw  = request.getHeader("X-User-Roles");
        String tweensRaw = request.getHeader("X-User-TweenIds");

        List<String> roles = parseCommaSeparated(rolesRaw);
        List<String> tweenIds = parseCommaSeparated(tweensRaw);

        UserContext ctx = UserContext.builder()
                .userId(userId)
                .email(email)
                .roles(roles)
                .tweenIds(tweenIds)
                .build();

        UserContextHolder.set(ctx);
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request,
                                HttpServletResponse response,
                                Object handler, Exception ex) {
        UserContextHolder.clear(); // prevent thread pool leaks
    }

    private List<String> parseCommaSeparated(String value) {
        if (value == null || value.isBlank()) return List.of();
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}
