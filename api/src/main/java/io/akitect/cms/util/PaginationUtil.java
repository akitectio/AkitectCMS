package io.akitect.cms.util;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;

/**
 * Utility class for pagination display in views.
 */
public class PaginationUtil {
    
    private PaginationUtil() {
        // Private constructor to prevent instantiation
    }
    
    /**
     * Generate pagination numbers for display in the UI.
     *
     * @param page The current page object
     * @param maxPagesToShow Maximum number of page numbers to display
     * @return List of page numbers to display
     */
    public static List<Integer> getPageNumbers(Page<?> page, int maxPagesToShow) {
        int totalPages = page.getTotalPages();
        int currentPage = page.getNumber() + 1;
        
        List<Integer> pageNumbers = new ArrayList<>();
        
        if (totalPages <= maxPagesToShow) {
            // If there are fewer pages than the max to show, display all
            for (int i = 1; i <= totalPages; i++) {
                pageNumbers.add(i);
            }
        } else {
            // Calculate start and end based on current page position
            int half = maxPagesToShow / 2;
            int start = Math.max(currentPage - half, 1);
            int end = Math.min(start + maxPagesToShow - 1, totalPages);
            
            // Adjust start if we're near the end
            if (end == totalPages) {
                start = Math.max(end - maxPagesToShow + 1, 1);
            }
            
            for (int i = start; i <= end; i++) {
                pageNumbers.add(i);
            }
            
            // Add first page and ellipsis if not starting from page 1
            if (start > 1) {
                pageNumbers.add(0, 1);
                if (start > 2) {
                    pageNumbers.add(1, -1); // -1 represents ellipsis
                }
            }
            
            // Add last page and ellipsis if not ending at the last page
            if (end < totalPages) {
                if (end < totalPages - 1) {
                    pageNumbers.add(-1); // -1 represents ellipsis
                }
                pageNumbers.add(totalPages);
            }
        }
        
        return pageNumbers;
    }
}
