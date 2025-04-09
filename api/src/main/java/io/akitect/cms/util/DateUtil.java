package io.akitect.cms.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Date;

/**
 * Utility class for date and time operations.
 */
public class DateUtil {
    
    public static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd";
    public static final String DEFAULT_DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
    public static final String DISPLAY_DATE_FORMAT = "MMM d, yyyy";
    public static final String DISPLAY_DATETIME_FORMAT = "MMM d, yyyy HH:mm";
    
    private DateUtil() {
        // Private constructor to prevent instantiation
    }
    
    /**
     * Format LocalDateTime to string using the default format.
     *
     * @param dateTime The LocalDateTime to format
     * @return Formatted date time string
     */
    public static String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return formatDateTime(dateTime, DEFAULT_DATETIME_FORMAT);
    }
    
    /**
     * Format LocalDateTime to string using the specified format.
     *
     * @param dateTime The LocalDateTime to format
     * @param pattern The format pattern
     * @return Formatted date time string
     */
    public static String formatDateTime(LocalDateTime dateTime, String pattern) {
        if (dateTime == null) {
            return null;
        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
        return dateTime.format(formatter);
    }
    
    /**
     * Format LocalDate to string using the default format.
     *
     * @param date The LocalDate to format
     * @return Formatted date string
     */
    public static String formatDate(LocalDate date) {
        if (date == null) {
            return null;
        }
        return formatDate(date, DEFAULT_DATE_FORMAT);
    }
    
    /**
     * Format LocalDate to string using the specified format.
     *
     * @param date The LocalDate to format
     * @param pattern The format pattern
     * @return Formatted date string
     */
    public static String formatDate(LocalDate date, String pattern) {
        if (date == null) {
            return null;
        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
        return date.format(formatter);
    }
    
    /**
     * Parse string to LocalDateTime using the default format.
     *
     * @param dateTimeStr The date time string
     * @return LocalDateTime object
     */
    public static LocalDateTime parseDateTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.isEmpty()) {
            return null;
        }
        return parseDateTime(dateTimeStr, DEFAULT_DATETIME_FORMAT);
    }
    
    /**
     * Parse string to LocalDateTime using the specified format.
     *
     * @param dateTimeStr The date time string
     * @param pattern The format pattern
     * @return LocalDateTime object
     */
    public static LocalDateTime parseDateTime(String dateTimeStr, String pattern) {
        if (dateTimeStr == null || dateTimeStr.isEmpty()) {
            return null;
        }
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(pattern);
        return LocalDateTime.parse(dateTimeStr, formatter);
    }
    
    /**
     * Convert Date to LocalDateTime.
     *
     * @param date The Date to convert
     * @return LocalDateTime object
     */
    public static LocalDateTime toLocalDateTime(Date date) {
        if (date == null) {
            return null;
        }
        return ZonedDateTime.ofInstant(date.toInstant(), ZoneId.systemDefault()).toLocalDateTime();
    }
    
    /**
     * Convert LocalDateTime to Date.
     *
     * @param localDateTime The LocalDateTime to convert
     * @return Date object
     */
    public static Date toDate(LocalDateTime localDateTime) {
        if (localDateTime == null) {
            return null;
        }
        return Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
    }
    
    /**
     * Get a human-readable relative time string (e.g., "5 minutes ago").
     *
     * @param dateTime The LocalDateTime to convert
     * @return Human-readable relative time string
     */
    public static String getRelativeTimeString(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "";
        }
        
        LocalDateTime now = LocalDateTime.now();
        long seconds = ChronoUnit.SECONDS.between(dateTime, now);
        
        if (seconds < 60) {
            return "just now";
        }
        
        long minutes = seconds / 60;
        if (minutes < 60) {
            return minutes + " minute" + (minutes > 1 ? "s" : "") + " ago";
        }
        
        long hours = minutes / 60;
        if (hours < 24) {
            return hours + " hour" + (hours > 1 ? "s" : "") + " ago";
        }
        
        long days = hours / 24;
        if (days < 30) {
            return days + " day" + (days > 1 ? "s" : "") + " ago";
        }
        
        long months = days / 30;
        if (months < 12) {
            return months + " month" + (months > 1 ? "s" : "") + " ago";
        }
        
        long years = months / 12;
        return years + " year" + (years > 1 ? "s" : "") + " ago";
    }
}
