package com.meetup.apigateway.config;

import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.HashSet;
import java.util.Set;

@Configuration
public class RetryConfig {

    private static final int MAX_RETRIES = 3;
    private static final Duration INITIAL_BACKOFF = Duration.ofMillis(100);

    @Bean
    public GlobalFilter retryFilter() {
        return (exchange, chain) -> chain.filter(exchange)
                .retryWhen(Retry.backoff(MAX_RETRIES, INITIAL_BACKOFF)
                        .filter(throwable -> isRetryableError(throwable))
                        .doBeforeRetry(retrySignal -> {
                            long attempt = retrySignal.totalRetries() + 1;
                            exchange.getAttributes().put("retryCount", (int) attempt);
                        }));
    }

    private boolean isRetryableError(Throwable throwable) {
        // Retry on connection errors and 5xx errors
        if (throwable instanceof org.springframework.web.reactive.function.client.WebClientResponseException) {
            org.springframework.web.reactive.function.client.WebClientResponseException ex =
                    (org.springframework.web.reactive.function.client.WebClientResponseException) throwable;
            HttpStatus status = HttpStatus.resolve(ex.getStatusCode().value());
            return status != null && status.is5xxServerError();
        }
        return true; // Retry on connection errors (IO exceptions)
    }

}
