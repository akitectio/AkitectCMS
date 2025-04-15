package io.akitect.cms.util;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.CollectionUtils;

import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;

/**
 * Utility class for fulltext search operations.
 */
public final class SearchUtils {

    private SearchUtils() {
        // Private constructor to prevent instantiation
    }

    /**
     * Normalize search text by removing excess whitespace and special characters
     * 
     * @param text Text to normalize
     * @return Normalized text
     */
    public static String normalizeSearchText(String text) {
        if (text == null) {
            return "";
        }

        // Remove special characters and extra spaces
        return text.replaceAll("[^a-zA-Z0-9\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim()
                .toLowerCase();
    }

    /**
     * Split search text into tokens for more effective searching
     * 
     * @param searchText Text to tokenize
     * @return List of search tokens
     */
    public static List<String> tokenizeSearchText(String searchText) {
        if (StringUtils.isBlank(searchText)) {
            return new ArrayList<>();
        }

        String normalized = normalizeSearchText(searchText);

        // Split by spaces and filter out tokens less than 2 chars
        return Arrays.stream(normalized.split("\\s+"))
                .filter(token -> token.length() >= 2)
                .collect(Collectors.toList());
    }

    /**
     * Create a specification for full-text search across multiple fields
     * 
     * @param <T>        Entity type
     * @param searchText Text to search for
     * @param fields     Fields to search in
     * @return Specification for the search
     */
    @SafeVarargs
    public static <T> Specification<T> createFullTextSpecification(String searchText, String... fields) {
        if (StringUtils.isBlank(searchText) || fields.length == 0) {
            return null;
        }

        List<String> tokens = tokenizeSearchText(searchText);

        if (CollectionUtils.isEmpty(tokens)) {
            return null;
        }

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            for (String token : tokens) {
                List<Predicate> tokenPredicates = new ArrayList<>();
                String likePattern = "%" + token + "%";

                for (String field : fields) {
                    Expression<String> expression = FilterUtils.getPropertyPath(root, field);
                    tokenPredicates.add(cb.like(cb.lower(expression), likePattern));
                }

                // Each token must match at least one field
                predicates.add(cb.or(tokenPredicates.toArray(new Predicate[0])));
            }

            // All tokens must be matched
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Calculate match relevance score for sorting results
     * 
     * @param <T>        Entity type
     * @param searchText Search text
     * @param fieldScore Map of field names to their importance score
     * @return Specification that adds score calculation
     */
    public static <T> Specification<T> withRelevanceScore(
            String searchText, Map<String, Integer> fieldScore) {

        if (StringUtils.isBlank(searchText) || CollectionUtils.isEmpty(fieldScore)) {
            return null;
        }

        List<String> tokens = tokenizeSearchText(searchText);

        if (CollectionUtils.isEmpty(tokens)) {
            return null;
        }

        return (root, query, cb) -> {
            // For each field and token, calculate score when there's a match
            List<Expression<Integer>> scores = new ArrayList<>();

            fieldScore.forEach((field, weight) -> {
                Path<String> fieldPath = FilterUtils.getPropertyPath(root, field);

                for (String token : tokens) {
                    // Add weight score when field contains the token
                    scores.add(cb.<Integer>selectCase()
                            .when(cb.like(cb.lower(fieldPath), "%" + token + "%"), weight)
                            .otherwise(0));

                    // Bonus points for exact match
                    scores.add(cb.<Integer>selectCase()
                            .when(cb.equal(cb.lower(fieldPath), token), weight * 2)
                            .otherwise(0));
                }
            });

            // Sum all scores to get total relevance
            Expression<Integer> totalScore = scores.get(0);
            for (int i = 1; i < scores.size(); i++) {
                totalScore = cb.sum(totalScore, scores.get(i));
            }

            // Add score as a selection
            query.multiselect(root, totalScore);
            query.orderBy(cb.desc(totalScore));

            // Must have a score > 0
            return cb.gt(totalScore, 0);
        };
    }

    /**
     * Create a specification that performs full-text search and calculates
     * relevance score
     * 
     * @param <T>        Entity type
     * @param searchText Text to search for
     * @param fieldScore Map of field names to their importance score
     * @return Combined specification
     */
    public static <T> Specification<T> searchWithRelevance(
            String searchText, Map<String, Integer> fieldScore) {

        if (StringUtils.isBlank(searchText) || CollectionUtils.isEmpty(fieldScore)) {
            return null;
        }

        Specification<T> textSearch = createFullTextSpecification(
                searchText, fieldScore.keySet().toArray(new String[0]));

        Specification<T> relevanceScore = withRelevanceScore(searchText, fieldScore);

        return Specification.where(textSearch).and(relevanceScore);
    }
}