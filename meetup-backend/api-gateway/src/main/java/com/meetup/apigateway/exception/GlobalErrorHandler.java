package com.meetup.apigateway.exception;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Component
@Order(-1)
public class GlobalErrorHandler implements ErrorWebExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalErrorHandler.class);
    private static final String CORRELATION_ID_HEADER = "X-Correlation-ID";
    private static final String CORRELATION_ID_MDC_KEY = "correlationId";

    private final ObjectMapper objectMapper;

    public GlobalErrorHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
        ServerHttpResponse response = exchange.getResponse();
        
        String correlationId = exchange.getRequest().getHeaders().getFirst(CORRELATION_ID_HEADER);
        if (correlationId == null) {
            correlationId = MDC.get(CORRELATION_ID_MDC_KEY);
        }
        if (correlationId == null) {
            correlationId = "unknown";
        }

        HttpStatus status;
        String error;
        String message;

        if (ex instanceof ResponseStatusException rse) {
            status = (HttpStatus) rse.getStatusCode();
            error = status.getReasonPhrase();
            message = rse.getReason() != null ? rse.getReason() : ex.getMessage();
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            error = "Internal Server Error";
            message = "An unexpected error occurred";
        }

        ErrorResponse errorResponse = new ErrorResponse(
            status.value(),
            error,
            message,
            exchange.getRequest().getPath().value(),
            correlationId
        );

        response.setStatusCode(status);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        response.getHeaders().add(CORRELATION_ID_HEADER, correlationId);

        log.error("Gateway error: {} - Path: {} - Correlation ID: {} - Message: {}", 
            status, exchange.getRequest().getPath().value(), correlationId, message, ex);

        byte[] bytes;
        try {
            bytes = objectMapper.writeValueAsBytes(errorResponse);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize error response", e);
            String fallbackError = "{\"status\":500,\"error\":\"Internal Server Error\",\"message\":\"Failed to serialize error response\"}";
            bytes = fallbackError.getBytes(StandardCharsets.UTF_8);
        }

        DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }
}
