package io.akitect.cms.controller.admin;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import io.akitect.cms.dto.PostCreateDTO;
import io.akitect.cms.dto.PostDTO;
import io.akitect.cms.dto.PostRevisionDTO;
import io.akitect.cms.dto.PostUpdateDTO;
import io.akitect.cms.model.User;
import io.akitect.cms.repository.UserRepository;
import io.akitect.cms.security.UserDetailsImpl;
import io.akitect.cms.service.PostService;
import io.akitect.cms.util.Constants;
import io.akitect.cms.util.PageableUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping(Constants.ADMIN_BASE_PATH + "/posts")
@Tag(name = "Post Management", description = "APIs for managing posts in the system")
public class PostController extends AdminBaseController {

    @Autowired
    private PostService postService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get all posts with pagination and filtering
     */
    @GetMapping
    @Operation(summary = "Get all posts with pagination and filtering")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved posts"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Object>> getAllPosts(
            @Parameter(description = "Page number (zero-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction (asc or desc)") @RequestParam(defaultValue = "desc") String direction,
            @Parameter(description = "Search term for title or content") @RequestParam(required = false) String search,
            @Parameter(description = "Filter by status (DRAFT, PUBLISHED, etc.)") @RequestParam(required = false) String status,
            @Parameter(description = "Filter by category ID") @RequestParam(required = false) UUID categoryId,
            @Parameter(description = "Filter by author ID") @RequestParam(required = false) UUID authorId,
            @Parameter(description = "Filter by featured posts") @RequestParam(required = false) Boolean featured) {

        // Create pageable
        var pageable = PageableUtil.createPageRequest(page, size, sortBy, direction);

        // Build filter map
        Map<String, Object> filters = new HashMap<>();

        // Add search filter (if provided)
        if (search != null && !search.isEmpty()) {
            filters.put("title", "*" + search + "*");
        }

        // Add status filter (if provided)
        if (status != null && !status.isEmpty()) {
            filters.put("status", status);
        }

        // Add category filter (if provided)
        if (categoryId != null) {
            filters.put("categories.id", categoryId);
        }

        // Add author filter (if provided)
        if (authorId != null) {
            filters.put("author.id", authorId);
        }

        // Add featured filter (if provided)
        if (featured != null) {
            filters.put("featured", featured);
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
     * Get a post by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get a post by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved post"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Post not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<PostDTO> getPostById(@PathVariable UUID id) {
        PostDTO post = postService.getPostById(id);
        return ResponseEntity.ok(post);
    }

    /**
     * Create a new post
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new post")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Post created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<PostDTO> createPost(
            @Valid @RequestBody PostCreateDTO postCreateDTO,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        // If no authorId is provided, set the current user as author
        if (postCreateDTO.getAuthorId() == null) {
            postCreateDTO.setAuthorId(userDetails.getId());
        }

        PostDTO createdPost = postService.createPost(postCreateDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
    }

    /**
     * Update an existing post
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update an existing post")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Post updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Post not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<PostDTO> updatePost(
            @PathVariable UUID id,
            @Valid @RequestBody PostUpdateDTO postUpdateDTO,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {

        // Get current user for revision tracking
        User currentUser = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        PostDTO updatedPost = postService.updatePost(id, postUpdateDTO, currentUser);
        return ResponseEntity.ok(updatedPost);
    }

    /**
     * Delete a post
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a post")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Post deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Post not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public void deletePost(@PathVariable UUID id) {
        postService.deletePost(id);
    }

    /**
     * Get featured posts
     */
    @GetMapping("/featured")
    @Operation(summary = "Get featured posts")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved featured posts"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Object>> getFeaturedPosts(
            @Parameter(description = "Maximum number of posts to return") @RequestParam(defaultValue = "5") int limit) {

        var pageable = PageableUtil.createPageRequest(0, limit, "createdAt", "desc");
        var featuredPosts = postService.getFeaturedPosts(pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("posts", featuredPosts);
        response.put("count", featuredPosts.size());

        return ResponseEntity.ok(response);
    }

    /**
     * Get posts by category
     */
    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get posts by category")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved posts"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Object>> getPostsByCategory(
            @PathVariable UUID categoryId,
            @Parameter(description = "Page number (zero-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction (asc or desc)") @RequestParam(defaultValue = "desc") String direction) {

        var pageable = PageableUtil.createPageRequest(page, size, sortBy, direction);
        Page<PostDTO> posts = postService.getPostsByCategory(categoryId, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("posts", posts.getContent());
        response.put("currentPage", posts.getNumber());
        response.put("totalItems", posts.getTotalElements());
        response.put("totalPages", posts.getTotalPages());

        return ResponseEntity.ok(response);
    }

    /**
     * Search posts
     */
    @GetMapping("/search")
    @Operation(summary = "Search posts")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully searched posts"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Object>> searchPosts(
            @Parameter(description = "Search query") @RequestParam String query,
            @Parameter(description = "Page number (zero-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction (asc or desc)") @RequestParam(defaultValue = "desc") String direction) {

        var pageable = PageableUtil.createPageRequest(page, size, sortBy, direction);
        Page<PostDTO> posts = postService.searchPosts(query, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("posts", posts.getContent());
        response.put("currentPage", posts.getNumber());
        response.put("totalItems", posts.getTotalElements());
        response.put("totalPages", posts.getTotalPages());

        return ResponseEntity.ok(response);
    }

    /**
     * Get post statistics
     */
    @GetMapping("/statistics")
    @Operation(summary = "Get post statistics for dashboard")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved post statistics"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Object>> getPostStatistics() {
        Map<String, Object> statistics = postService.getPostStatistics();
        return ResponseEntity.ok(statistics);
    }

    /**
     * Get post revisions
     */
    @GetMapping("/{id}/revisions")
    @Operation(summary = "Get revisions history for a post")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved post revisions"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "403", description = "Forbidden"),
            @ApiResponse(responseCode = "404", description = "Post not found"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<PostRevisionDTO>> getPostRevisions(@PathVariable UUID id) {
        List<PostRevisionDTO> revisions = postService.getPostRevisions(id);
        return ResponseEntity.ok(revisions);
    }
}