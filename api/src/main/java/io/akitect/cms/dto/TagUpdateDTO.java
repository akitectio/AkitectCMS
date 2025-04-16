package io.akitect.cms.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TagUpdateDTO {
    @Size(max = 50, message = "Tag name cannot exceed 50 characters")
    private String name;

    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug can only contain lowercase letters, numbers, and hyphens")
    @Size(max = 60, message = "Slug cannot exceed 60 characters")
    private String slug;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;
}