package com.meetup.apigateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class LoggingFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(LoggingFilter.class);
    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    private static final String CORRELATION_ID_MDC_KEY = "correlationId";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String correlationId = getOrGenerateCorrelationId(exchange);
        
        // Set correlation ID in MDC for logging
        MDC.put(CORRELATION_ID_MDC_KEY, correlationId);
        
        long startTime = System.currentTimeMillis();
        String method = exchange.getRequest().getMethod().name();
        String path = exchange.getRequest().getPath().value();
        String remoteAddress = exchange.getRequest().getRemoteAddress() != null 
            ? exchange.getRequest().getRemoteAddress().getAddress().getHostAddress() 
            : "unknown";
        
        log.info("Incoming request: {} {} from {} - Correlation ID: {}", method, path, remoteAddress, correlationId);
        
        // Add correlation ID to response headers
        exchange.getResponse().getHeaders().add(CORRELATION_ID_HEADER, correlationId);
        
        return chain.filter(exchange)
            .doOnSuccess(aVoid -> {
                long duration = System.currentTimeMillis() - startTime;
                int statusCode = exchange.getResponse().getStatusCode() != null 
                    ? exchange.getResponse().getStatusCode().value() 
                    : 0;
                log.info("Request completed: {} {} - Status: {} - Duration: {}ms - Correlation ID: {}", 
                    method, path, statusCode, duration, correlationId);
                MDC.remove(CORRELATION_ID_MDC_KEY);
            })
            .doOnError(error -> {
                long duration = System.currentTimeMillis() - startTime;
                log.error("Request failed: {} {} - Error: {} - Duration: {}ms - Correlation ID: {}", 
                    method, path, error.getMessage(), duration, correlationId, error);
                MDC.remove(CORRELATION_ID_MDC_KEY);
            });
    }

    private String getOrGenerateCorrelationId(ServerWebExchange exchange) {
        String correlationId = exchange.getRequest().getHeaders().getFirst(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }
        return correlationId;
    }

    @Override
    public int getOrder() {
        return -200; // Run before JwtAuthFilter (-100) to ensure correlation ID is set early
    }
}
