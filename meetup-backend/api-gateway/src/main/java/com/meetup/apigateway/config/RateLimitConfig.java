package com.meetup.apigateway.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Bucket4j;
import io.github.bucket4j.Refill;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class RateLimitConfig {

    @Value("${rate.limit.capacity:100}")
    private int capacity;

    @Value("${rate.limit.refill.tokens:10}")
    private int refillTokens;

    @Value("${rate.limit.refill.duration:1}")
    private int refillDurationSeconds;

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    @Bean
    public RateLimitService rateLimitService() {
        return new RateLimitService();
    }

    public class RateLimitService {
        public Bucket resolveBucket(String key) {
            return cache.computeIfAbsent(key, k -> createNewBucket());
        }

        private Bucket createNewBucket() {
            Refill refill = Refill.greedy(refillTokens, Duration.ofSeconds(refillDurationSeconds));
            Bandwidth limit = Bandwidth.classic(capacity, refill);
            return Bucket4j.builder()
                    .addLimit(limit)
                    .build();
        }
    }
}
