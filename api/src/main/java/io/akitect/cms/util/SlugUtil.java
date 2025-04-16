package io.akitect.cms.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Utility class for generating URL-friendly slugs.
 */
public class SlugUtil {

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final Pattern MULTIPLE_HYPHENS = Pattern.compile("-{2,}");

    private SlugUtil() {
        // Private constructor to prevent instantiation
    }

    /**
     * Create a URL-friendly slug from the given string
     * 
     * @param input String to convert to slug
     * @return URL-friendly slug
     */
    public static String createSlug(String input) {
        if (input == null) {
            return "";
        }

        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        slug = MULTIPLE_HYPHENS.matcher(slug).replaceAll("-");
        return slug.toLowerCase(Locale.ENGLISH).trim();
    }

    /**
     * Generate a URL-friendly slug from the given string
     * This method serves as an alias for createSlug to maintain backward
     * compatibility
     * 
     * @param input String to convert to slug
     * @return URL-friendly slug
     */
    public static String generateSlug(String input) {
        return createSlug(input);
    }
}
