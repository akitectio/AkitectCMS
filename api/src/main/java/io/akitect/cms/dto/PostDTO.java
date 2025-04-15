package io.akitect.cms.dto;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import lombok.Data;

@Data
public class PostDTO {
    private UUID id;
    private String title;
    private String slug;
    private String content;
    private String excerpt;
    private String featuredImageUrl;
    private String status;
    private LocalDateTime publishedAt;
    private String metaTitle;
    private String metaDescription;
    private boolean featured;
    private boolean allowComments;
    private int viewsCount;

    private UUID authorId;
    private String authorUsername;
    private String authorFullName;

    private Set<CategoryDTO> categories = new HashSet<>();
    private Set<TagDTO> tags = new HashSet<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}