package io.akitect.cms.util;

import org.apache.commons.lang3.StringUtils;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

/**
 * Utility class for SEO operations.
 */
public class SeoUtil {
    
    private static final int META_TITLE_MAX_LENGTH = 60;
    private static final int META_DESCRIPTION_MAX_LENGTH = 160;
    
    private SeoUtil() {
        // Private constructor to prevent instantiation
    }
    
    /**
     * Generate a meta title from the given content title.
     * If the title is too long, it truncates it and adds ellipsis.
     *
     * @param title The content title
     * @param siteName The site name to append
     * @return An optimized meta title
     */
    public static String generateMetaTitle(String title, String siteName) {
        if (StringUtils.isBlank(title)) {
            return siteName;
        }
        
        String cleanTitle = Jsoup.clean(title, Safelist.none());
        int maxTitleLength = siteName != null ? (META_TITLE_MAX_LENGTH - siteName.length() - 3) : META_TITLE_MAX_LENGTH;
        
        if (cleanTitle.length() <= maxTitleLength) {
            return siteName != null ? cleanTitle + " | " + siteName : cleanTitle;
        } else {
            return siteName != null ? 
                   cleanTitle.substring(0, maxTitleLength) + "... | " + siteName : 
                   cleanTitle.substring(0, META_TITLE_MAX_LENGTH) + "...";
        }
    }
    
    /**
     * Generate a meta description from the given content.
     * Strips HTML tags and truncates to the recommended length.
     *
     * @param content The content to generate description from
     * @return An optimized meta description
     */
    public static String generateMetaDescription(String content) {
        if (StringUtils.isBlank(content)) {
            return "";
        }
        
        // Strip HTML tags
        String plainText = Jsoup.clean(content, Safelist.none());
        
        // Remove extra whitespace
        plainText = plainText.replaceAll("\\s+", " ").trim();
        
        // Truncate to recommended length
        if (plainText.length() <= META_DESCRIPTION_MAX_LENGTH) {
            return plainText;
        } else {
            return plainText.substring(0, META_DESCRIPTION_MAX_LENGTH) + "...";
        }
    }
    
    /**
     * Extract the first image URL from HTML content for social sharing.
     *
     * @param htmlContent The HTML content
     * @return The first image URL or null if not found
     */
    public static String extractFirstImageUrl(String htmlContent) {
        if (StringUtils.isBlank(htmlContent)) {
            return null;
        }
        
        org.jsoup.nodes.Document doc = Jsoup.parse(htmlContent);
        org.jsoup.nodes.Element imgElement = doc.select("img").first();
        
        return imgElement != null ? imgElement.attr("src") : null;
    }
    
    /**
     * Clean text for SEO purposes - remove excess whitespace, HTML tags, etc.
     *
     * @param text The text to clean
     * @return Cleaned text
     */
    public static String cleanText(String text) {
        if (StringUtils.isBlank(text)) {
            return "";
        }
        
        // Strip HTML tags
        String cleanText = Jsoup.clean(text, Safelist.none());
        
        // Remove excess whitespace
        cleanText = cleanText.replaceAll("\\s+", " ").trim();
        
        return cleanText;
    }
    
    /**
     * Create canonical URL with base URL and path.
     *
     * @param baseUrl The base URL of the site
     * @param path The path to append
     * @return Complete canonical URL
     */
    public static String createCanonicalUrl(String baseUrl, String path) {
        if (StringUtils.isBlank(baseUrl)) {
            return path;
        }
        
        String base = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        String pathSegment = path.startsWith("/") ? path : "/" + path;
        
        return base + pathSegment;
    }
}
