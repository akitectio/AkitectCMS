package io.akitect.cms.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import io.akitect.cms.dto.CategoryDTO;
import io.akitect.cms.dto.PostCreateDTO;
import io.akitect.cms.dto.PostDTO;
import io.akitect.cms.dto.PostRevisionDTO;
import io.akitect.cms.dto.PostUpdateDTO;
import io.akitect.cms.dto.TagDTO;
import io.akitect.cms.model.Category;
import io.akitect.cms.model.Post;
import io.akitect.cms.model.PostRevision;
import io.akitect.cms.model.Tag;
import io.akitect.cms.model.User;
import io.akitect.cms.repository.CategoryRepository;
import io.akitect.cms.repository.PostRepository;
import io.akitect.cms.repository.TagRepository;
import io.akitect.cms.repository.UserRepository;
import io.akitect.cms.util.PageableUtil;
import io.akitect.cms.util.SlugUtil;
import io.akitect.cms.util.SpecificationUtils;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private TagRepository tagRepository;

    /**
     * Get all posts with pagination
     * 
     * @param pageable Pagination information
     * @return Paginated list of PostDTOs
     */
    public Page<PostDTO> getAllPosts(Pageable pageable) {
        return postRepository.findAll(pageable).map(this::convertToDTO);
    }

    /**
     * Get all posts with filtering
     * 
     * @param filters  Map of filters
     * @param pageable Pagination information
     * @return Filtered paginated list of PostDTOs
     */
    public Page<PostDTO> getFilteredPosts(Map<String, Object> filters, Pageable pageable) {
        Specification<Post> spec = SpecificationUtils.buildSpecification(filters);
        return postRepository.findAll(spec, pageable).map(this::convertToDTO);
    }

    /**
     * Get post by ID
     * 
     * @param id Post ID
     * @return PostDTO
     */
    public PostDTO getPostById(UUID id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        return convertToDTO(post);
    }

    /**
     * Get post by slug
     * 
     * @param slug Post slug
     * @return PostDTO
     */
    public PostDTO getPostBySlug(String slug) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        return convertToDTO(post);
    }

    /**
     * Search posts
     * 
     * @param query    Search query
     * @param pageable Pagination information
     * @return Paginated list of PostDTOs
     */
    public Page<PostDTO> searchPosts(String query, Pageable pageable) {
        return postRepository.search(query, pageable).map(this::convertToDTO);
    }

    /**
     * Get posts by category
     * 
     * @param categoryId Category ID
     * @param pageable   Pagination information
     * @return Paginated list of PostDTOs
     */
    public Page<PostDTO> getPostsByCategory(UUID categoryId, Pageable pageable) {
        return postRepository.findByCategoryId(categoryId, pageable).map(this::convertToDTO);
    }

    /**
     * Get featured posts
     * 
     * @param pageable Pagination information
     * @return List of featured PostDTOs
     */
    public List<PostDTO> getFeaturedPosts(Pageable pageable) {
        return postRepository.findFeaturedPosts(pageable).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create a new post
     * 
     * @param postCreateDTO Post creation data
     * @return Created PostDTO
     */
    @Transactional
    public PostDTO createPost(PostCreateDTO postCreateDTO) {
        Post post = new Post();
        User author = userRepository.findById(postCreateDTO.getAuthorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Author not found"));

        post.setTitle(postCreateDTO.getTitle());
        post.setContent(postCreateDTO.getContent());
        post.setExcerpt(postCreateDTO.getExcerpt());
        post.setFeaturedImageUrl(postCreateDTO.getFeaturedImageUrl());
        post.setStatus(postCreateDTO.getStatus());
        post.setMetaTitle(postCreateDTO.getMetaTitle());
        post.setMetaDescription(postCreateDTO.getMetaDescription());
        post.setFeatured(postCreateDTO.isFeatured());
        post.setAllowComments(postCreateDTO.isAllowComments());
        post.setAuthor(author);

        // Generate slug if not provided
        if (postCreateDTO.getSlug() != null && !postCreateDTO.getSlug().trim().isEmpty()) {
            post.setSlug(SlugUtil.createSlug(postCreateDTO.getSlug()));
        } else {
            post.setSlug(SlugUtil.createSlug(postCreateDTO.getTitle()));
        }

        // Ensure slug is unique
        ensureUniqueSlug(post);

        // Set published date if status is PUBLISHED
        if ("PUBLISHED".equalsIgnoreCase(post.getStatus())) {
            post.setPublishedAt(LocalDateTime.now());
        }

        // Set audit fields
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());

        // Add categories if present
        if (postCreateDTO.getCategoryIds() != null && !postCreateDTO.getCategoryIds().isEmpty()) {
            Set<Category> categories = postCreateDTO.getCategoryIds().stream()
                    .map(id -> categoryRepository.findById(id)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                    "Category not found with ID: " + id)))
                    .collect(Collectors.toSet());
            post.setCategories(categories);
        }

        // Add tags if present
        if (postCreateDTO.getTagIds() != null && !postCreateDTO.getTagIds().isEmpty()) {
            Set<Tag> tags = postCreateDTO.getTagIds().stream()
                    .map(id -> tagRepository.findById(String.valueOf(id))
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                    "Tag not found with ID: " + id)))
                    .collect(Collectors.toSet());
            post.setTags(tags);
        }

        // Create initial revision
        PostRevision revision = new PostRevision();
        revision.setPost(post);
        revision.setTitle(post.getTitle());
        revision.setContent(post.getContent());
        revision.setExcerpt(post.getExcerpt());
        revision.setRevisionNumber(1);
        revision.setCreatedBy(author);
        revision.setCreatedAt(LocalDateTime.now());

        Set<PostRevision> revisions = new HashSet<>();
        revisions.add(revision);
        post.setRevisions(revisions);

        Post savedPost = postRepository.save(post);
        return convertToDTO(savedPost);
    }

    /**
     * Update an existing post
     * 
     * @param id            Post ID
     * @param postUpdateDTO Post update data
     * @param currentUser   Current authenticated user
     * @return Updated PostDTO
     */
    @Transactional
    public PostDTO updatePost(UUID id, PostUpdateDTO postUpdateDTO, User currentUser) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        // Check if status changed from draft to published
        boolean publishNow = !post.getStatus().equals("PUBLISHED") &&
                postUpdateDTO.getStatus().equals("PUBLISHED");

        // Update basic fields
        post.setTitle(postUpdateDTO.getTitle());
        post.setContent(postUpdateDTO.getContent());
        post.setExcerpt(postUpdateDTO.getExcerpt());
        post.setFeaturedImageUrl(postUpdateDTO.getFeaturedImageUrl());
        post.setStatus(postUpdateDTO.getStatus());
        post.setMetaTitle(postUpdateDTO.getMetaTitle());
        post.setMetaDescription(postUpdateDTO.getMetaDescription());
        post.setFeatured(postUpdateDTO.isFeatured());
        post.setAllowComments(postUpdateDTO.isAllowComments());

        // Update slug if provided
        if (postUpdateDTO.getSlug() != null && !postUpdateDTO.getSlug().trim().isEmpty() &&
                !post.getSlug().equals(SlugUtil.createSlug(postUpdateDTO.getSlug()))) {
            post.setSlug(SlugUtil.createSlug(postUpdateDTO.getSlug()));
            ensureUniqueSlug(post);
        }

        // Set published date if being published for the first time
        if (publishNow) {
            post.setPublishedAt(LocalDateTime.now());
        }

        post.setUpdatedAt(LocalDateTime.now());

        // Update categories if present
        if (postUpdateDTO.getCategoryIds() != null) {
            Set<Category> categories = postUpdateDTO.getCategoryIds().stream()
                    .map(catId -> categoryRepository.findById(catId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                    "Category not found with ID: " + catId)))
                    .collect(Collectors.toSet());
            post.setCategories(categories);
        }

        // Update tags if present
        if (postUpdateDTO.getTagIds() != null) {
            Set<Tag> tags = postUpdateDTO.getTagIds().stream()
                    .map(tagId -> tagRepository.findById(tagId)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                    "Tag not found with ID: " + tagId)))
                    .collect(Collectors.toSet());
            post.setTags(tags);
        }

        // Create new revision
        PostRevision revision = new PostRevision();
        revision.setPost(post);
        revision.setTitle(post.getTitle());
        revision.setContent(post.getContent());
        revision.setExcerpt(post.getExcerpt());
        revision.setRevisionNumber(post.getRevisions().size() + 1);
        revision.setCreatedBy(currentUser);
        revision.setCreatedAt(LocalDateTime.now());

        post.getRevisions().add(revision);

        Post savedPost = postRepository.save(post);
        return convertToDTO(savedPost);
    }

    /**
     * Delete a post
     * 
     * @param id Post ID
     */
    @Transactional
    public void deletePost(UUID id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));
        postRepository.delete(post);
    }

    /**
     * Increment the view count for a post
     * 
     * @param id Post ID
     * @return Updated view count
     */
    @Transactional
    public int incrementViewCount(UUID id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        post.setViewsCount(post.getViewsCount() + 1);
        postRepository.save(post);

        return post.getViewsCount();
    }

    /**
     * Get related posts based on categories
     * 
     * @param postId Post ID
     * @param limit  Maximum number of posts to return
     * @return List of related PostDTOs
     */
    public List<PostDTO> getRelatedPosts(UUID postId, int limit) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        // Return empty list if post has no categories
        if (post.getCategories() == null || post.getCategories().isEmpty()) {
            return List.of();
        }

        var pageable = PageableUtil.createPageRequest(0, limit, "publishedAt", "desc");
        return postRepository.findRelatedPosts(postId, pageable).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get post statistics
     * 
     * @return Map containing post statistics
     */
    public Map<String, Object> getPostStatistics() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalPosts", postRepository.count());
        stats.put("publishedPosts", postRepository.countPublishedPosts());
        stats.put("draftPosts", postRepository.countDraftPosts());

        // Get most viewed posts
        var pageable = PageableUtil.createPageRequest(0, 5, "viewsCount", "desc");
        List<PostDTO> mostViewedPosts = postRepository.findAll(pageable).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        stats.put("mostViewedPosts", mostViewedPosts);

        return stats;
    }

    /**
     * Get revisions for a post
     * 
     * @param id Post ID
     * @return List of post revisions
     */
    public List<PostRevisionDTO> getPostRevisions(UUID id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (post.getRevisions() == null || post.getRevisions().isEmpty()) {
            return List.of();
        }

        return post.getRevisions().stream()
                .map(this::convertRevisionToDTO)
                .sorted((r1, r2) -> Integer.compare(r2.getRevisionNumber(), r1.getRevisionNumber())) // Sort by revision
                                                                                                     // number desc
                .collect(Collectors.toList());
    }

    /**
     * Convert PostRevision entity to PostRevisionDTO
     * 
     * @param revision PostRevision entity
     * @return PostRevisionDTO
     */
    private PostRevisionDTO convertRevisionToDTO(PostRevision revision) {
        PostRevisionDTO dto = new PostRevisionDTO();
        dto.setId(revision.getId());
        dto.setPostId(revision.getPost().getId());
        dto.setRevisionNumber(revision.getRevisionNumber());
        dto.setTitle(revision.getTitle());
        dto.setContent(revision.getContent());
        dto.setExcerpt(revision.getExcerpt());
        dto.setCreatedAt(revision.getCreatedAt());

        if (revision.getCreatedBy() != null) {
            dto.setCreatedById(revision.getCreatedBy().getId());
            dto.setCreatedByUsername(revision.getCreatedBy().getUsername());
            dto.setCreatedByFullName(revision.getCreatedBy().getFullName());
        }

        return dto;
    }

    /**
     * Convert Post entity to PostDTO
     * 
     * @param post Post entity
     * @return PostDTO
     */
    public PostDTO convertToDTO(Post post) {
        PostDTO dto = new PostDTO();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setSlug(post.getSlug());
        dto.setContent(post.getContent());
        dto.setExcerpt(post.getExcerpt());
        dto.setFeaturedImageUrl(post.getFeaturedImageUrl());
        dto.setStatus(post.getStatus());
        dto.setPublishedAt(post.getPublishedAt());
        dto.setMetaTitle(post.getMetaTitle());
        dto.setMetaDescription(post.getMetaDescription());
        dto.setFeatured(post.isFeatured());
        dto.setAllowComments(post.isAllowComments());
        dto.setViewsCount(post.getViewsCount());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());

        // Set author information
        if (post.getAuthor() != null) {
            dto.setAuthorId(post.getAuthor().getId());
            dto.setAuthorUsername(post.getAuthor().getUsername());
            dto.setAuthorFullName(post.getAuthor().getFullName());
        }

        // Set categories
        if (post.getCategories() != null && !post.getCategories().isEmpty()) {
            Set<CategoryDTO> categoryDTOs = post.getCategories().stream()
                    .map(this::convertCategoryToDTO)
                    .collect(Collectors.toSet());
            dto.setCategories(categoryDTOs);
        }

        // Set tags
        if (post.getTags() != null && !post.getTags().isEmpty()) {
            Set<TagDTO> tagDTOs = post.getTags().stream()
                    .map(this::convertTagToDTO)
                    .collect(Collectors.toSet());
            dto.setTags(tagDTOs);
        }

        return dto;
    }

    /**
     * Convert Category entity to CategoryDTO
     * 
     * @param category Category entity
     * @return CategoryDTO
     */
    private CategoryDTO convertCategoryToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setSlug(category.getSlug());
        dto.setDescription(category.getDescription());
        return dto;
    }

    /**
     * Convert Tag entity to TagDTO
     * 
     * @param tag Tag entity
     * @return TagDTO
     */
    private TagDTO convertTagToDTO(Tag tag) {
        TagDTO dto = new TagDTO();
        dto.setId(tag.getId());
        dto.setName(tag.getName());
        dto.setSlug(tag.getSlug());
        return dto;
    }

    /**
     * Ensure slug is unique by appending a number if needed
     * 
     * @param post Post to update with unique slug
     */
    private void ensureUniqueSlug(Post post) {
        String baseSlug = post.getSlug();
        String currentSlug = baseSlug;
        int counter = 1;

        while (true) {
            // Check if this is an existing post being updated
            if (post.getId() != null) {
                // For existing posts, we need to check slugs except our own
                boolean exists = postRepository.findBySlug(currentSlug)
                        .map(existingPost -> !existingPost.getId().equals(post.getId()))
                        .orElse(false);

                if (!exists) {
                    break;
                }
            } else {
                // For new posts, just check if slug exists
                if (!postRepository.existsBySlug(currentSlug)) {
                    break;
                }
            }

            // Append counter to slug
            currentSlug = baseSlug + "-" + counter++;
        }

        post.setSlug(currentSlug);
    }
}