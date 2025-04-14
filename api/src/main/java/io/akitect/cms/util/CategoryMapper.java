package io.akitect.cms.util;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import io.akitect.cms.dto.CategoryDTO;
import io.akitect.cms.model.Category;

public class CategoryMapper {

    /**
     * Converts a list of Category entities to a tree structure of CategoryDTOs
     * 
     * @param categories List of all categories from the database
     * @return List of top-level CategoryDTOs with their children properly nested
     */
    public static List<CategoryDTO> toCategoryTreeDTOs(List<Category> categories) {
        List<CategoryDTO> rootCategories = new ArrayList<>();
        Map<UUID, CategoryDTO> dtoMap = new HashMap<>();

        // First pass: Create all DTOs without children
        for (Category category : categories) {
            CategoryDTO dto = toCategoryDTO(category);
            dtoMap.put(category.getId(), dto);

            // Check if it's a root category (no parent)
            if (category.getParent() == null) {
                rootCategories.add(dto);
            }
        }

        // Second pass: Build the hierarchy
        for (Category category : categories) {
            if (category.getParent() != null) {
                CategoryDTO childDto = dtoMap.get(category.getId());
                CategoryDTO parentDto = dtoMap.get(category.getParent().getId());

                if (parentDto != null) {
                    parentDto.getChildren().add(childDto);
                }
            }
        }

        // Sort all categories by display order
        sortCategoryTreeByDisplayOrder(rootCategories);

        return rootCategories;
    }

    /**
     * Converts a single Category entity to a CategoryDTO without children
     */
    private static CategoryDTO toCategoryDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setSlug(category.getSlug());
        dto.setDescription(category.getDescription());
        dto.setMetaTitle(category.getMetaTitle());
        dto.setMetaDescription(category.getMetaDescription());
        dto.setFeatured(category.isFeatured());
        dto.setDisplayOrder(category.getDisplayOrder());

        if (category.getParent() != null) {
            dto.setParentId(category.getParent().getId());
        }

        return dto;
    }

    /**
     * Recursively sorts all categories in the tree by display order
     */
    private static void sortCategoryTreeByDisplayOrder(List<CategoryDTO> categories) {
        if (categories == null || categories.isEmpty()) {
            return;
        }

        // Sort the current level
        categories.sort(Comparator.comparing(CategoryDTO::getDisplayOrder));

        // Recursively sort children
        for (CategoryDTO category : categories) {
            sortCategoryTreeByDisplayOrder(category.getChildren());
        }
    }
}