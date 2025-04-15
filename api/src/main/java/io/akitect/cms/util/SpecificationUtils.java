package io.akitect.cms.util;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Predicate;

/**
 * Utility class for building and combining JPA Specifications.
 */
public final class SpecificationUtils {

    private SpecificationUtils() {
        // Private constructor to prevent instantiation
    }

    /**
     * Create a specification that checks if a field equals a value
     * 
     * @param <T>   Entity type
     * @param field Field name
     * @param value Value to compare with
     * @return Field equality specification
     */
    public static <T> Specification<T> fieldEquals(String field, Object value) {
        if (value == null) {
            return null;
        }

        return (root, query, cb) -> cb.equal(root.get(field), value);
    }

    /**
     * Create a specification that checks if a string field contains a value
     * (case-insensitive)
     * 
     * @param <T>   Entity type
     * @param field Field name
     * @param value Value to search for
     * @return Field contains specification
     */
    public static <T> Specification<T> fieldContains(String field, String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }

        String searchTerm = "%" + value.toLowerCase() + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get(field)), searchTerm);
    }

    /**
     * Create a specification that checks if a field's value is in a list
     * 
     * @param <T>    Entity type
     * @param field  Field name
     * @param values List of values to check against
     * @return Field in list specification
     */
    public static <T> Specification<T> fieldIn(String field, List<?> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }

        return (root, query, cb) -> root.get(field).in(values);
    }

    /**
     * Create a specification that checks if a field's value is not in a list
     * 
     * @param <T>    Entity type
     * @param field  Field name
     * @param values List of values to check against
     * @return Field not in list specification
     */
    public static <T> Specification<T> fieldNotIn(String field, List<?> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }

        return (root, query, cb) -> cb.not(root.get(field).in(values));
    }

    /**
     * Create a specification that checks if a date field is between two dates
     * 
     * @param <T>       Entity type
     * @param field     Field name
     * @param startDate Start date
     * @param endDate   End date
     * @return Date between specification
     */
    public static <T> Specification<T> dateBetween(String field, LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate == null && endDate == null) {
            return null;
        }

        return (root, query, cb) -> {
            if (startDate != null && endDate != null) {
                return cb.between(root.get(field), startDate, endDate);
            } else if (startDate != null) {
                return cb.greaterThanOrEqualTo(root.get(field), startDate);
            } else {
                return cb.lessThanOrEqualTo(root.get(field), endDate);
            }
        };
    }

    /**
     * Create a specification that checks if a field is null
     * 
     * @param <T>   Entity type
     * @param field Field name
     * @return Field is null specification
     */
    public static <T> Specification<T> isNull(String field) {
        return (root, query, cb) -> cb.isNull(root.get(field));
    }

    /**
     * Create a specification that checks if a field is not null
     * 
     * @param <T>   Entity type
     * @param field Field name
     * @return Field is not null specification
     */
    public static <T> Specification<T> isNotNull(String field) {
        return (root, query, cb) -> cb.isNotNull(root.get(field));
    }

    /**
     * Build a dynamic specification from filter parameters
     * 
     * @param <T>     Entity type
     * @param filters Map of field names to filter values
     * @return Combined specification
     */
    @SuppressWarnings("unchecked")
    public static <T> Specification<T> buildSpecification(Map<String, Object> filters) {
        if (filters == null || filters.isEmpty()) {
            return null;
        }

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            filters.forEach((field, value) -> {
                if (value != null) {
                    if (value instanceof String) {
                        String stringValue = (String) value;
                        if (StringUtils.hasText(stringValue)) {
                            // Handle special operators
                            if (stringValue.startsWith("*") && stringValue.endsWith("*")) {
                                // Contains
                                String searchTerm = stringValue.substring(1, stringValue.length() - 1);
                                predicates.add(cb.like(cb.lower(root.get(field)),
                                        "%" + searchTerm.toLowerCase() + "%"));
                            } else if (stringValue.startsWith("*")) {
                                // Ends with
                                String searchTerm = stringValue.substring(1);
                                predicates.add(cb.like(cb.lower(root.get(field)),
                                        "%" + searchTerm.toLowerCase()));
                            } else if (stringValue.endsWith("*")) {
                                // Starts with
                                String searchTerm = stringValue.substring(0, stringValue.length() - 1);
                                predicates.add(cb.like(cb.lower(root.get(field)),
                                        searchTerm.toLowerCase() + "%"));
                            } else if (stringValue.startsWith("!")) {
                                // Not equals
                                String searchTerm = stringValue.substring(1);
                                predicates.add(cb.notEqual(root.get(field), searchTerm));
                            } else if (field.endsWith("Id") || field.endsWith("UUID")) {
                                // UUID field
                                try {
                                    UUID uuid = UUID.fromString(stringValue);
                                    predicates.add(cb.equal(root.get(field), uuid));
                                } catch (IllegalArgumentException e) {
                                    // Invalid UUID, ignore this filter
                                }
                            } else {
                                // Default exact match
                                predicates.add(cb.equal(root.get(field), stringValue));
                            }
                        }
                    } else if (value instanceof List) {
                        // IN operator
                        predicates.add(root.get(field).in((List<?>) value));
                    } else if (value instanceof Boolean) {
                        // Boolean equality
                        predicates.add(cb.equal(root.get(field), value));
                    } else if (value instanceof Number) {
                        // Numeric equality
                        predicates.add(cb.equal(root.get(field), value));
                    } else if (value instanceof Map) {
                        // Range operators for numeric and date fields
                        Map<String, Object> rangeValues = (Map<String, Object>) value;

                        if (rangeValues.containsKey("min") && rangeValues.get("min") != null) {
                            predicates.add(cb.greaterThanOrEqualTo(root.get(field),
                                    (Comparable) rangeValues.get("min")));
                        }

                        if (rangeValues.containsKey("max") && rangeValues.get("max") != null) {
                            predicates.add(cb.lessThanOrEqualTo(root.get(field),
                                    (Comparable) rangeValues.get("max")));
                        }

                        if (rangeValues.containsKey("eq") && rangeValues.get("eq") != null) {
                            predicates.add(cb.equal(root.get(field), rangeValues.get("eq")));
                        }

                        if (rangeValues.containsKey("ne") && rangeValues.get("ne") != null) {
                            predicates.add(cb.notEqual(root.get(field), rangeValues.get("ne")));
                        }
                    }
                }
            });

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Combine multiple specifications with AND operator, filtering out null
     * specifications
     * 
     * @param <T>            Entity type
     * @param specifications List of specifications to combine
     * @return Combined specification
     */
    @SafeVarargs
    public static <T> Specification<T> and(Specification<T>... specifications) {
        Specification<T> result = null;

        for (Specification<T> spec : specifications) {
            if (spec != null) {
                if (result == null) {
                    result = Specification.where(spec);
                } else {
                    result = result.and(spec);
                }
            }
        }

        return result;
    }

    /**
     * Combine multiple specifications with OR operator, filtering out null
     * specifications
     * 
     * @param <T>            Entity type
     * @param specifications List of specifications to combine
     * @return Combined specification
     */
    @SafeVarargs
    public static <T> Specification<T> or(Specification<T>... specifications) {
        Specification<T> result = null;

        for (Specification<T> spec : specifications) {
            if (spec != null) {
                if (result == null) {
                    result = Specification.where(spec);
                } else {
                    result = result.or(spec);
                }
            }
        }

        return result;
    }
}