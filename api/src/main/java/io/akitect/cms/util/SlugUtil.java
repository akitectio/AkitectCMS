package io.akitect.cms.util;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Utility class for generating and managing slugs.
 */
public class SlugUtil {
    
    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");
    private static final Pattern EDGESDHASHES = Pattern.compile("(^-|-$)");
    
    private SlugUtil() {
        // Private constructor to prevent instantiation
    }
    
    /**
     * Generate a slug from the input string.
     * 
     * @param input The string to convert to a slug
     * @return A URL-friendly slug
     */
    public static String generateSlug(String input) {
        if (input == null || input.isEmpty()) {
            return "";
        }
        
        String result = input.trim().toLowerCase(Locale.ENGLISH);
        
        // Remove accents
        result = Normalizer.normalize(result, Normalizer.Form.NFD);
        result = NONLATIN.matcher(result).replaceAll("");
        
        // Replace whitespace with hyphens
        result = WHITESPACE.matcher(result).replaceAll("-");
        
        // Remove consecutive hyphens
        result = result.replaceAll("-+", "-");
        
        // Remove leading and trailing hyphens
        result = EDGESDHASHES.matcher(result).replaceAll("");
        
        return result;
    }
    
    /**
     * Appends a number to the slug if necessary to make it unique.
     * 
     * @param baseSlug The base slug
     * @param counter The counter to append
     * @return A modified slug with counter
     */
    public static String appendCounter(String baseSlug, int counter) {
        return baseSlug + "-" + counter;
    }
}
