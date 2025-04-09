package io.akitect.cms.exception.custom;

// UnauthorizedException.java
public class UnauthorizedException extends RuntimeException {
    
    private static final long serialVersionUID = 1L;

    public UnauthorizedException(String message) {
        super(message);
    }
}

