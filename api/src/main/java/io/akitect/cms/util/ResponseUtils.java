package io.akitect.cms.util;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * Utility class for building standardized API responses.
 */
public final class ResponseUtils {

    private ResponseUtils() {
        // Private constructor to prevent instantiation
    }

    /**
     * Create a standardized paginated response
     * 
     * @param <T>  Content type
     * @param page Page object containing the data
     * @param key  Key name for the content in the response
     * @return ResponseEntity with standardized pagination format
     */
    public static <T> ResponseEntity<Map<String, Object>> createPaginatedResponse(Page<T> page, String key) {
        Map<String, Object> response = new HashMap<>();
        response.put(key, page.getContent());
        response.put("currentPage", page.getNumber());
        response.put("totalItems", page.getTotalElements());
        response.put("totalPages", page.getTotalPages());
        response.put("pageSize", page.getSize());
        response.put("isFirst", page.isFirst());
        response.put("isLast", page.isLast());
        response.put("hasNext", page.hasNext());
        response.put("hasPrevious", page.hasPrevious());

        return ResponseEntity.ok(response);
    }

    /**
     * Create a standardized paginated response with transformation
     * 
     * @param <T>         Original content type
     * @param <R>         Transformed content type
     * @param page        Page object containing the data
     * @param key         Key name for the content in the response
     * @param transformer Function to transform each item
     * @return ResponseEntity with standardized pagination format
     */
    public static <T, R> ResponseEntity<Map<String, Object>> createPaginatedResponse(
            Page<T> page, String key, java.util.function.Function<T, R> transformer) {

        List<R> transformedContent = page.getContent().stream()
                .map(transformer)
                .toList();

        Map<String, Object> response = new HashMap<>();
        response.put(key, transformedContent);
        response.put("currentPage", page.getNumber());
        response.put("totalItems", page.getTotalElements());
        response.put("totalPages", page.getTotalPages());
        response.put("pageSize", page.getSize());
        response.put("isFirst", page.isFirst());
        response.put("isLast", page.isLast());
        response.put("hasNext", page.hasNext());
        response.put("hasPrevious", page.hasPrevious());

        return ResponseEntity.ok(response);
    }

    /**
     * Create a success response with data
     * 
     * @param <T>  Data type
     * @param data Data to include in the response
     * @return ResponseEntity with data
     */
    public static <T> ResponseEntity<T> success(T data) {
        return ResponseEntity.ok(data);
    }

    /**
     * Create a success response with data and custom status
     * 
     * @param <T>    Data type
     * @param data   Data to include in the response
     * @param status HTTP status for the response
     * @return ResponseEntity with data and status
     */
    public static <T> ResponseEntity<T> success(T data, HttpStatus status) {
        return ResponseEntity.status(status).body(data);
    }

    /**
     * Create a success response for created resources
     * 
     * @param <T>  Data type
     * @param data Data to include in the response
     * @return ResponseEntity with CREATED status
     */
    public static <T> ResponseEntity<T> created(T data) {
        return ResponseEntity.status(HttpStatus.CREATED).body(data);
    }

    /**
     * Create a success message response
     * 
     * @param message Success message
     * @return ResponseEntity with message
     */
    public static ResponseEntity<Map<String, Object>> message(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    /**
     * Create an error message response
     * 
     * @param message Error message
     * @param status  HTTP status for the error
     * @return ResponseEntity with error details
     */
    public static ResponseEntity<Map<String, Object>> error(String message, HttpStatus status) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", message);
        response.put("status", status.value());

        return ResponseEntity.status(status).body(response);
    }

    /**
     * Create a validation error response
     * 
     * @param errors Map of field names to error messages
     * @return ResponseEntity with validation errors
     */
    public static ResponseEntity<Map<String, Object>> validationError(Map<String, String> errors) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Validation failed");
        response.put("errors", errors);
        response.put("status", HttpStatus.BAD_REQUEST.value());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}