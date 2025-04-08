package io.akitect.cms.exception.custom;

// ForbiddenException.java
public class ForbiddenException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public ForbiddenException(String message) {
        super(message);
    }
}
