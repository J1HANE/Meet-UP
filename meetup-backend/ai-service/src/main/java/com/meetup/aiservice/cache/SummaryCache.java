package com.meetup.aiservice.cache;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.meetup.aiservice.model.SummaryResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class SummaryCache {

    private static final String KEY_PREFIX = "summary:";

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${meetup.cache.summary-live-ttl-seconds:30}")
    private long liveTtlSeconds;

    @Value("${meetup.cache.summary-completed-ttl-seconds:86400}")
    private long completedTtlSeconds;

    public Optional<SummaryResult> get(String meetingId) {
        try {
            var key   = KEY_PREFIX + meetingId;
            var value = redisTemplate.opsForValue().get(key);
            if (value == null) {
                log.debug("Cache B MISS for meeting {}", meetingId);
                return Optional.empty();
            }
            log.debug("Cache B HIT for meeting {}", meetingId);
            return Optional.of(objectMapper.readValue(value, SummaryResult.class));
        } catch (Exception e) {
            log.warn("Cache B read failed for meeting {}: {}", meetingId, e.getMessage());
            return Optional.empty();
        }
    }

    public void put(SummaryResult result, boolean meetingComplete) {
        try {
            var key   = KEY_PREFIX + result.getMeetingId();
            var value = objectMapper.writeValueAsString(result);
            var ttl   = meetingComplete
                    ? Duration.ofSeconds(completedTtlSeconds)
                    : Duration.ofSeconds(liveTtlSeconds);

            redisTemplate.opsForValue().set(key, value, ttl);
            log.debug("Cache B WRITE for meeting {} with TTL {}s",
                    result.getMeetingId(), ttl.toSeconds());
        } catch (Exception e) {
            log.warn("Cache B write failed for meeting {}: {}", result.getMeetingId(), e.getMessage());
            // Cache failure is non-fatal — pipeline continues
        }
    }

    public void evict(String meetingId) {
        redisTemplate.delete(KEY_PREFIX + meetingId);
        log.debug("Cache B EVICT for meeting {}", meetingId);
    }
}

