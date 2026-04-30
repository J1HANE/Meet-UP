package com.meetup.authservice.exception;

public class TokenRefreshException extends AuthException {

    public TokenRefreshException(String message) {
        super(message, "TOKEN_REFRESH_FAILED");
    }
}
