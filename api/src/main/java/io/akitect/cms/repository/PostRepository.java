package io.akitect.cms.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import io.akitect.cms.model.Post;
import io.akitect.cms.model.User;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID>, JpaSpecificationExecutor<Post> {

    Optional<Post> findBySlug(String slug);

    Boolean existsBySlug(String slug);

    Page<Post> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    Page<Post> findByAuthor(User author, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.featured = true")
    List<Post> findFeaturedPosts(Pageable pageable);

    @Query("SELECT p FROM Post p JOIN p.categories c WHERE c.id = :categoryId")
    Page<Post> findByCategoryId(@Param("categoryId") UUID categoryId, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE " +
            "LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.excerpt) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Post> search(@Param("query") String query, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.status = 'PUBLISHED'")
    Page<Post> findPublishedPosts(Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.status = 'PUBLISHED' AND p.featured = true")
    List<Post> findFeaturedPublishedPosts(Pageable pageable);

    @Query("SELECT p FROM Post p " +
            "JOIN p.categories c " +
            "WHERE p.status = 'PUBLISHED' AND p.id != :postId AND c.id IN " +
            "(SELECT c2.id FROM Post p2 JOIN p2.categories c2 WHERE p2.id = :postId)")
    List<Post> findRelatedPosts(@Param("postId") UUID postId, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Post p WHERE p.status = 'PUBLISHED'")
    long countPublishedPosts();

    @Query("SELECT COUNT(p) FROM Post p WHERE p.status = 'DRAFT'")
    long countDraftPosts();
}