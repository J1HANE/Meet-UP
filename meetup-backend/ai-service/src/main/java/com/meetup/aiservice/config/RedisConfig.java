package com.meetup.aiservice.config;

import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import tools.jackson.databind.ObjectMapper;


import java.time.Duration;
import java.util.Map;

@Configuration
public class RedisConfig {

    @Value("${meetup.cache.summary-live-ttl-seconds:30}")
    private long summaryLiveTtlSeconds;

    @Value("${meetup.cache.summary-completed-ttl-seconds:86400}")
    private long summaryCompletedTtlSeconds;

    /**
     * Two named caches:
     *   "summary-live"      — short TTL, for in-progress meetings
     *   "summary-completed" — long TTL, for ended meetings (data is frozen)
     */
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        var objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        var serializer = new GenericJacksonJsonRedisSerializer(objectMapper);

        var baseConfig = RedisCacheConfiguration.defaultCacheConfig()
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(serializer))
                .disableCachingNullValues();

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(baseConfig.entryTtl(Duration.ofSeconds(summaryLiveTtlSeconds)))
                .withInitialCacheConfigurations(Map.of(
                        "summary-live",
                        baseConfig.entryTtl(Duration.ofSeconds(summaryLiveTtlSeconds)),
                        "summary-completed",
                        baseConfig.entryTtl(Duration.ofSeconds(summaryCompletedTtlSeconds))
                ))
                .build();
    }

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
}

