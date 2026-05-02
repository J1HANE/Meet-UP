package com.meetup.taskservice.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.*;

@RestControllerAdvice
class GlobalControllerExceptionHandler {

    private static final Logger LOG = LoggerFactory.getLogger(GlobalControllerExceptionHandler.class);

    @ResponseStatus(NOT_FOUND)
    @ExceptionHandler(EntityNotFoundException.class)
    public @ResponseBody HttpErrorInfo handleTaskNotFoundException(
            ServerHttpRequest request, EntityNotFoundException ex) {

        return createHttpErrorInfo(NOT_FOUND, request, ex);
    }

    @ResponseStatus(CONFLICT)
    @ExceptionHandler(EntityAlreadyExistsException.class)
    public @ResponseBody HttpErrorInfo handleTaskAlreadyExistsException(
            ServerHttpRequest request, EntityAlreadyExistsException ex) {

        return createHttpErrorInfo(CONFLICT, request, ex);
    }

    @ResponseStatus(UNPROCESSABLE_ENTITY)
    @ExceptionHandler(InvalidTaskException.class)
    public @ResponseBody HttpErrorInfo handleInvalidTaskException(
            ServerHttpRequest request, InvalidTaskException ex) {

        return createHttpErrorInfo(UNPROCESSABLE_ENTITY, request, ex);
    }

    @ResponseStatus(BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)        // handles @Valid failures
    public @ResponseBody HttpErrorInfo handleValidationExceptions(
            ServerHttpRequest request, MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));

        return createHttpErrorInfo(BAD_REQUEST, request, new RuntimeException(message));
    }

    private HttpErrorInfo createHttpErrorInfo(
            HttpStatus httpStatus, ServerHttpRequest request, Exception ex) {

        final String path = request.getURI().getPath();
        final String message = ex.getMessage();

        LOG.debug("Returning HTTP status: {} for path: {}, message: {}", httpStatus, path, message);
        return new HttpErrorInfo(httpStatus, path, message);
    }
}
