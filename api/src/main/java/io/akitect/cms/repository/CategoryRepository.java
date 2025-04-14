package io.akitect.cms.repository;

import java.util.UUID;

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
}