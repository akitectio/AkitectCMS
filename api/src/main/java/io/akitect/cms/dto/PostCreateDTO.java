package io.akitect.cms.dto;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PostCreateDTO {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    private String excerpt;

    private String featuredImageUrl;

    private String slug;

    @NotBlank(message = "Status is required")
    @Size(max = 20, message = "Status must be at most 20 characters")
    private String status = "DRAFT";

    private String metaTitle;

    private String metaDescription;

    private boolean featured = false;

    private boolean allowComments = true;

    @NotNull(message = "Author ID is required")
    private UUID authorId;

    private Set<UUID> categoryIds = new HashSet<>();

    private Set<UUID> tagIds = new HashSet<>();
}