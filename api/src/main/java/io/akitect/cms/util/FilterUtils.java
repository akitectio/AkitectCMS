package io.akitect.cms.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.From;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

/**
 * Utility class for building JPA Specifications for dynamic filtering.
 */
public final class FilterUtils {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private FilterUtils() {
        // Private constructor to prevent instantiation
    }

    /**
     * Build a like predicate for case-insensitive string search
     * 
     * @param <T>   Entity type
     * @param cb    CriteriaBuilder
     * @param field Path to the field
     * @param value Search value
     * @return Predicate
     */
    public static <T> Predicate containsIgnoreCase(CriteriaBuilder cb, Path<String> field, String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return cb.like(cb.lower(field), "%" + value.toLowerCase() + "%");
    }

    /**
     * Build a like predicate for case-insensitive search across multiple string
     * fields
     * 
     * @param <T>    Entity type
     * @param cb     CriteriaBuilder
     * @param search Search string
     * @param fields Fields to search in
     * @return Combined Predicate
     */
    @SafeVarargs
    public static <T> Predicate searchAcrossFields(CriteriaBuilder cb, String search, Path<String>... fields) {
        if (!StringUtils.hasText(search)) {
            return null;
        }

        List<Predicate> predicates = new ArrayList<>();
        String searchPattern = "%" + search.toLowerCase() + "%";

        for (Path<String> field : fields) {
            predicates.add(cb.like(cb.lower(field), searchPattern));
        }

        return cb.or(predicates.toArray(new Predicate[0]));
    }

    /**
     * Build a predicate for UUID equality
     * 
     * @param <T>   Entity type
     * @param cb    CriteriaBuilder
     * @param field Path to the UUID field
     * @param value UUID string
     * @return Predicate
     */
    public static <T> Predicate uuidEquals(CriteriaBuilder cb, Path<UUID> field, String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }

        try {
            UUID uuid = UUID.fromString(value);
            return cb.equal(field, uuid);
        } catch (IllegalArgumentException e) {
            return cb.disjunction(); // False predicate if UUID is invalid
        }
    }

    /**
     * Build a predicate for boolean equality
     * 
     * @param <T>   Entity type
     * @param cb    CriteriaBuilder
     * @param field Path to the boolean field
     * @param value Boolean string "true" or "false"
     * @return Predicate
     */
    public static <T> Predicate booleanEquals(CriteriaBuilder cb, Path<Boolean> field, String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }

        return cb.equal(field, Boolean.parseBoolean(value));
    }

    /**
     * Build a predicate for date equality
     * 
     * @param <T>   Entity type
     * @param cb    CriteriaBuilder
     * @param field Path to the LocalDate field
     * @param value Date string in format "yyyy-MM-dd"
     * @return Predicate
     */
    public static <T> Predicate dateEquals(CriteriaBuilder cb, Path<LocalDate> field, String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }

        try {
            LocalDate date = LocalDate.parse(value, DATE_FORMATTER);
            return cb.equal(field, date);
        } catch (DateTimeParseException e) {
            return cb.disjunction(); // False predicate if date is invalid
        }
    }

    /**
     * Build a predicate for date range
     * 
     * @param <T>   Entity type
     * @param cb    CriteriaBuilder
     * @param field Path to the LocalDateTime field
     * @param from  Start date string in format "yyyy-MM-dd"
     * @param to    End date string in format "yyyy-MM-dd"
     * @return Predicate
     */
    public static <T> Predicate dateTimeBetween(
            CriteriaBuilder cb, Path<LocalDateTime> field, String from, String to) {

        LocalDateTime fromDate = null;
        LocalDateTime toDate = null;

        if (StringUtils.hasText(from)) {
            try {
                fromDate = LocalDate.parse(from, DATE_FORMATTER).atStartOfDay();
            } catch (DateTimeParseException e) {
                // Invalid from date, ignore
            }
        }

        if (StringUtils.hasText(to)) {
            try {
                toDate = LocalDate.parse(to, DATE_FORMATTER).plusDays(1).atStartOfDay();
            } catch (DateTimeParseException e) {
                // Invalid to date, ignore
            }
        }

        if (fromDate != null && toDate != null) {
            return cb.and(
                    cb.greaterThanOrEqualTo(field, fromDate),
                    cb.lessThan(field, toDate));
        } else if (fromDate != null) {
            return cb.greaterThanOrEqualTo(field, fromDate);
        } else if (toDate != null) {
            return cb.lessThan(field, toDate);
        }

        return null;
    }

    /**
     * Get or create a join for a field path
     * 
     * @param <T>  Entity type
     * @param <J>  Join type
     * @param root Root entity
     * @param path Path string (dot notation)
     * @return The Join object
     */
    public static <T, J> Join<T, J> getOrCreateJoin(Root<T> root, String path) {
        String[] pathParts = path.split("\\.");
        From<?, ?> current = root;

        for (String part : pathParts) {
            boolean found = false;

            for (Join<?, ?> join : current.getJoins()) {
                if (join.getAttribute().getName().equals(part)) {
                    current = join;
                    found = true;
                    break;
                }
            }

            if (!found) {
                current = current.join(part, JoinType.LEFT);
            }
        }

        return (Join<T, J>) current;
    }

    /**
     * Create a path expression for a nested property using dot notation
     * 
     * @param <T>      Entity type
     * @param <Y>      Property type
     * @param root     Root entity
     * @param property Property path in dot notation (e.g., "user.address.city")
     * @return Path expression
     */
    @SuppressWarnings("unchecked")
    public static <T, Y> Expression<Y> getPropertyPath(Root<T> root, String property) {
        String[] parts = property.split("\\.");
        Path<?> path = root;

        for (String part : parts) {
            path = path.get(part);
        }

        return (Expression<Y>) path;
    }
}