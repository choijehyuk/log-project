package com.maplelog.maplelog.global.exception;

public class NexonApiException extends RuntimeException {

    private final int statusCode;

    public NexonApiException(int statusCode, String message) {
        super(message);
        this.statusCode = statusCode;
    }

    public int getStatusCode() {
        return statusCode;
    }
}