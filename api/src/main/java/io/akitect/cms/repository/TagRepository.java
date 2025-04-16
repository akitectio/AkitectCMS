package io.akitect.cms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import io.akitect.cms.model.Tag;

@Repository
public interface TagRepository extends JpaRepository<Tag, String> {

    Optional<Tag> findBySlug(String slug);

    Optional<Tag> findByName(String name);

    boolean existsByName(String name);

    boolean existsBySlug(String slug);

    @Query("SELECT t FROM Tag t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.slug) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Tag> searchTags(@Param("query") String query);

    @Query("SELECT t FROM Tag t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(t.slug) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Tag> searchTags(@Param("query") String query, Pageable pageable);
}