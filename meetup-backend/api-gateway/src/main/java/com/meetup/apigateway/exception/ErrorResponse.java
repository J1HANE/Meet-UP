package com.meetup.apigateway.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    private int status;
    private String error;
    private String message;
    private String path;
    private LocalDateTime timestamp;
    private String correlationId;
    private List<String> details;

    public ErrorResponse(int status, String error, String message, String path, String correlationId) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
        this.timestamp = LocalDateTime.now();
        this.correlationId = correlationId;
    }

    public ErrorResponse(int status, String error, String message, String path, String correlationId, List<String> details) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
        this.timestamp = LocalDateTime.now();
        this.correlationId = correlationId;
        this.details = details;
    }
}
