package io.akitect.cms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MessageResponse {
    private String message;
    private boolean success;

    public static MessageResponse success(String message) {
        return new MessageResponse(message, true);
    }

    public static MessageResponse error(String message) {
        return new MessageResponse(message, false);
    }
}