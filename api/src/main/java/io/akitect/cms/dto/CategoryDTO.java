package io.akitect.cms.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import lombok.Data;

@Data
public class CategoryDTO {
    private UUID id;
    private String name;
    private String slug;
    private String description;
    private UUID parentId;
    private String metaTitle;
    private String metaDescription;
    private boolean featured;
    private int displayOrder;
    private List<CategoryDTO> children = new ArrayList<>();
}