package com.meetup.meetingservice.exception;

import com.meetup.meetingservice.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MeetingServiceException.class)
    public ResponseEntity<ErrorResponse> handleMeetingServiceException(
            MeetingServiceException ex,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(ex.getStatus()).body(new ErrorResponse(
                ex.getErrorCode().name(),
                ex.getMessage(),
                Map.of(),
                Instant.now(),
                request.getRequestURI()
        ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {
        Map<String, Object> details = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            details.put(fieldName, error.getDefaultMessage());
        });

        return ResponseEntity.badRequest().body(new ErrorResponse(
                MeetingErrorCode.VALIDATION_ERROR.name(),
                "Validation failed",
                details,
                Instant.now(),
                request.getRequestURI()
        ));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex,
            HttpServletRequest request
    ) {
        Map<String, Object> details = new HashMap<>();
        ex.getConstraintViolations().forEach(violation ->
                details.put(violation.getPropertyPath().toString(), violation.getMessage()));

        return ResponseEntity.badRequest().body(new ErrorResponse(
                MeetingErrorCode.VALIDATION_ERROR.name(),
                "Validation failed",
                details,
                Instant.now(),
                request.getRequestURI()
        ));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException ex,
            HttpServletRequest request
    ) {
        String supported = ex.getSupportedHttpMethods() == null
                ? ""
                : String.join(", ", ex.getSupportedHttpMethods().stream().map(Object::toString).toList());

        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(new ErrorResponse(
                "METHOD_NOT_ALLOWED",
                "HTTP method " + ex.getMethod() + " is not supported for this endpoint. Use: " + supported,
                Map.of("supportedMethods", supported),
                Instant.now(),
                request.getRequestURI()
        ));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFound(
            NoResourceFoundException ex,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(
                "RESOURCE_NOT_FOUND",
                "No resource found for path " + request.getRequestURI(),
                Map.of("exception", ex.getClass().getSimpleName()),
                Instant.now(),
                request.getRequestURI()
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse(
                MeetingErrorCode.INTERNAL_ERROR.name(),
                "An unexpected error occurred",
                Map.of("exception", ex.getClass().getSimpleName()),
                Instant.now(),
                request.getRequestURI()
        ));
    }
}
