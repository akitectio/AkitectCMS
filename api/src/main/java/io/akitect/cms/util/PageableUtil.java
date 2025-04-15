package io.akitect.cms.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Utility class for creating Pageable objects with common configurations.
 * This simplifies pagination handling across controllers.
 */
public final class PageableUtil {

    private PageableUtil() {
        // Private constructor to prevent instantiation
    }

    /**
     * Create a PageRequest with the given parameters and basic validation
     * 
     * @param page      Page number (0-based)
     * @param size      Page size
     * @param sortBy    Field to sort by
     * @param direction Sort direction (asc/desc)
     * @return Configured PageRequest object
     */
    public static Pageable createPageRequest(int page, int size, String sortBy, String direction) {
        // Validate and set defaults
        int validatedPage = Math.max(0, page);
        int validatedSize = validatePageSize(size);
        Sort.Direction sortDirection = validateAndGetSortDirection(direction);

        return PageRequest.of(validatedPage, validatedSize, sortDirection, sortBy);
    }

    /**
     * Create a PageRequest with multiple sort fields
     * 
     * @param page       Page number (0-based)
     * @param size       Page size
     * @param direction  Sort direction (asc/desc)
     * @param properties Sort properties
     * @return Configured PageRequest object
     */
    public static Pageable createPageRequestMultiSort(int page, int size, String direction, String... properties) {
        // Validate and set defaults
        int validatedPage = Math.max(0, page);
        int validatedSize = validatePageSize(size);
        Sort.Direction sortDirection = validateAndGetSortDirection(direction);

        return PageRequest.of(validatedPage, validatedSize, Sort.by(sortDirection, properties));
    }

    /**
     * Create a PageRequest with the default sort field as "id"
     * 
     * @param page      Page number (0-based)
     * @param size      Page size
     * @param direction Sort direction (asc/desc)
     * @return Configured PageRequest object
     */
    public static Pageable createPageRequest(int page, int size, String direction) {
        return createPageRequest(page, size, "id", direction);
    }

    /**
     * Create a PageRequest with default sort field as "id" and default direction as
     * "asc"
     * 
     * @param page Page number (0-based)
     * @param size Page size
     * @return Configured PageRequest object
     */
    public static Pageable createPageRequest(int page, int size) {
        return createPageRequest(page, size, "id", "asc");
    }

    /**
     * Validate and sanitize page size to prevent performance issues
     * 
     * @param size Page size to validate
     * @return Validated page size
     */
    private static int validatePageSize(int size) {
        final int minPageSize = 1;
        final int maxPageSize = 100;
        final int defaultPageSize = 10;

        if (size < minPageSize) {
            return defaultPageSize;
        }

        return Math.min(size, maxPageSize);
    }

    /**
     * Validate and get sort direction
     * 
     * @param direction Sort direction string
     * @return Sort.Direction enum
     */
    private static Sort.Direction validateAndGetSortDirection(String direction) {
        return "desc".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
    }
}