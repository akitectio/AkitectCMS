package io.akitect.cms.controller.web;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.akitect.cms.dto.PostDTO;
import io.akitect.cms.model.Post;
import io.akitect.cms.repository.PostRepository;
import io.akitect.cms.service.PostService;
import io.akitect.cms.util.Constants;
import io.akitect.cms.util.PageableUtil;
import io.akitect.cms.util.SpecificationUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping(Constants.PUBLIC_BASE_PATH + "/posts")
@Tag(name = "Public Posts", description = "Public APIs for accessing published posts")
public class WebController {

    @Autowired
    private PostService postService;

    @Autowired
    private PostRepository postRepository;

    /**
     * Get published posts with pagination
     */
    @GetMapping
    @Operation(summary = "Get published posts with pagination")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved posts"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Object>> getPublishedPosts(
            @Parameter(description = "Page number (zero-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "publishedAt") String sortBy,
            @Parameter(description = "Sort direction (asc or desc)") @RequestParam(defaultValue = "desc") String direction,
            @Parameter(description = "Filter by category ID") @RequestParam(required = false) UUID categoryId) {

        // Create pageable
        var pageable = PageableUtil.createPageRequest(page, size, sortBy, direction);

        // Build filter map - only published posts
        Map<String, Object> filters = new HashMap<>();
        filters.put("status", "PUBLISHED");

        // Add category filter if provided
        if (categoryId != null) {
            filters.put("categories.id", categoryId);
        }

        // Get posts with filters
        Page<PostDTO> posts = postService.getFilteredPosts(filters, pageable);

        // Build response
        Map<String, Object> response = new HashMap<>();
        response.put("posts", posts.getContent());
        response.put("currentPage", posts.getNumber());
        response.put("totalItems", posts.getTotalElements());
        response.put("totalPages", posts.getTotalPages());

        return ResponseEntity.ok(response);
    }

    /**
     * Get a published post by slug
     */
    @GetMapping("/{slug}")
    @Operation(summary = "Get a published post by slug")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved post"),
            @ApiResponse(responseCode = "404", description = "Post not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<PostDTO> getPublishedPostBySlug(@PathVariable String slug) {
        PostDTO post = postService.getPostBySlug(slug);

        // Increment view count
        postService.incrementViewCount(post.getId());

        return ResponseEntity.ok(post);
    }

    /**
     * Get featured published posts
     */
    @GetMapping("/featured")
    @Operation(summary = "Get featured published posts")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved featured posts"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Object>> getFeaturedPublishedPosts(
            @Parameter(description = "Maximum number of posts to return") @RequestParam(defaultValue = "5") int limit) {

        var pageable = PageableUtil.createPageRequest(0, limit, "publishedAt", "desc");

        // Build specification for featured AND published posts
        Specification<Post> spec = SpecificationUtils.buildSpecification(Map.of(
                "status", "PUBLISHED",
                "featured", true));

        var posts = postRepository.findAll(spec, pageable).map(postService::convertToDTO).getContent();

        Map<String, Object> response = new HashMap<>();
        response.put("posts", posts);
        response.put("count", posts.size());

        return ResponseEntity.ok(response);
    }

    /**
     * Search published posts
     */
    @GetMapping("/search")
    @Operation(summary = "Search published posts")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully searched posts"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Object>> searchPublishedPosts(
            @Parameter(description = "Search query") @RequestParam String query,
            @Parameter(description = "Page number (zero-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int size) {

        var pageable = PageableUtil.createPageRequest(page, size, "publishedAt", "desc");

        // Create specification to search only published posts
        Specification<Post> spec = SpecificationUtils.buildSpecification(Map.of("status", "PUBLISHED"));

        // Combine with search query
        spec = spec.and((root, query1, criteriaBuilder) -> {
            String searchTerm = "%" + query.toLowerCase() + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), searchTerm),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("content")), searchTerm),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("excerpt")), searchTerm));
        });

        Page<PostDTO> posts = postRepository.findAll(spec, pageable).map(postService::convertToDTO);

        Map<String, Object> response = new HashMap<>();
        response.put("posts", posts.getContent());
        response.put("currentPage", posts.getNumber());
        response.put("totalItems", posts.getTotalElements());
        response.put("totalPages", posts.getTotalPages());

        return ResponseEntity.ok(response);
    }

    /**
     * Get related posts
     */
    @GetMapping("/{id}/related")
    @Operation(summary = "Get related posts based on categories")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved related posts"),
            @ApiResponse(responseCode = "404", description = "Post not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Object>> getRelatedPosts(
            @PathVariable UUID id,
            @Parameter(description = "Maximum number of posts to return") @RequestParam(defaultValue = "5") int limit) {

        var relatedPosts = postService.getRelatedPosts(id, limit);

        Map<String, Object> response = new HashMap<>();
        response.put("posts", relatedPosts);
        response.put("count", relatedPosts.size());

        return ResponseEntity.ok(response);
    }
}