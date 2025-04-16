package io.akitect.cms.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.akitect.cms.model.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    /**
     * Find a category by its slug
     * 
     * @param slug the slug to search for
     * @return the category with the given slug, if it exists
     */
    Category findBySlug(String slug);

    /**
     * Check if a slug exists for any category except the one with the given ID
     * 
     * @param slug the slug to check
     * @param id   the ID of the category to exclude from the check
     * @return true if another category with the same slug exists
     */
    boolean existsBySlugAndIdNot(String slug, UUID id);

    /**
     * Find categories by name containing the given string (case-insensitive)
     * Used for Select2 search functionality
     * 
     * @param name part of the name to search for
     * @return list of matching categories
     */
    List<Category> findByNameContainingIgnoreCase(String name);

    /**
     * Find categories by name containing the given string (case-insensitive) with
     * pagination
     * Used for Select2 search functionality with pagination
     * 
     * @param name     part of the name to search for
     * @param pageable pagination information
     * @return page of matching categories
     */
    Page<Category> findByNameContainingIgnoreCase(String name, Pageable pageable);
}