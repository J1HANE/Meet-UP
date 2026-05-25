package com.meetup.apigateway.filter;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import com.meetup.apigateway.config.RateLimitConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class RateLimitFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);
    private static final String RATE_LIMIT_HEADER = "X-RateLimit-Limit";
    private static final String RATE_LIMIT_REMAINING = "X-RateLimit-Remaining";
    private static final String RATE_LIMIT_RESET = "X-RateLimit-Reset";

    @Autowired
    private RateLimitConfig.RateLimitService rateLimitService;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String key = getRateLimitKey(request);

        Bucket bucket = rateLimitService.resolveBucket(key);
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            // Add rate limit headers to response
            exchange.getResponse().getHeaders().add(RATE_LIMIT_HEADER, String.valueOf(bucket.getAvailableTokens()));
            exchange.getResponse().getHeaders().add(RATE_LIMIT_REMAINING, String.valueOf(probe.getRemainingTokens()));
            exchange.getResponse().getHeaders().add(RATE_LIMIT_RESET, String.valueOf(probe.getNanosToWaitForRefill() / 1_000_000_000));

            log.debug("Rate limit check passed for key: {} - Remaining tokens: {}", key, probe.getRemainingTokens());
            return chain.filter(exchange);
        } else {
            log.warn("Rate limit exceeded for key: {}", key);
            exchange.getResponse().setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
            exchange.getResponse().getHeaders().add(RATE_LIMIT_HEADER, String.valueOf(bucket.getAvailableTokens()));
            exchange.getResponse().getHeaders().add(RATE_LIMIT_REMAINING, "0");
            exchange.getResponse().getHeaders().add(RATE_LIMIT_RESET, String.valueOf(probe.getNanosToWaitForRefill() / 1_000_000_000));
            exchange.getResponse().getHeaders().add("Retry-After", String.valueOf(probe.getNanosToWaitForRefill() / 1_000_000_000));
            return exchange.getResponse().setComplete();
        }
    }

    private String getRateLimitKey(ServerHttpRequest request) {
        // Use IP address as the rate limit key
        String ip = request.getRemoteAddress() != null 
            ? request.getRemoteAddress().getAddress().getHostAddress() 
            : "unknown";
        
        // Could also use user ID from JWT if available
        String userId = request.getHeaders().getFirst("X-User-Id");
        if (userId != null && !userId.isEmpty()) {
            return "user:" + userId;
        }
        
        return "ip:" + ip;
    }

    @Override
    public int getOrder() {
        return -150; // Run after LoggingFilter (-200) but before JwtAuthFilter (-100)
    }
}
