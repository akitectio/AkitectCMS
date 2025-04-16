package io.akitect.cms.util;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

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
        // Tạo một danh sách riêng để tránh ảnh hưởng đến danh sách gốc
        List<Category> workingList = new ArrayList<>(categories);

        // Lọc chỉ lấy các danh mục gốc (không có danh mục cha)
        List<Category> rootCategories = workingList.stream()
                .filter(cat -> cat.getParent() == null)
                .collect(Collectors.toList());

        // Ánh xạ các danh mục gốc thành DTO
        List<CategoryDTO> rootDTOs = rootCategories.stream()
                .map(root -> convertToTreeDTO(root, workingList))
                .collect(Collectors.toList());

        // Sắp xếp theo thứ tự hiển thị
        sortCategoryTreeByDisplayOrder(rootDTOs);

        return rootDTOs;
    }

    /**
     * Đệ quy chuyển đổi một danh mục và tất cả con của nó thành cấu trúc cây DTO
     * mà không gây ra đệ quy vô hạn
     */
    private static CategoryDTO convertToTreeDTO(Category category, List<Category> allCategories) {
        // Tạo DTO cho danh mục hiện tại
        CategoryDTO dto = toCategoryDTO(category);

        // Tìm tất cả các danh mục con trực tiếp của danh mục hiện tại
        List<Category> children = allCategories.stream()
                .filter(c -> c.getParent() != null && category.getId().equals(c.getParent().getId()))
                .collect(Collectors.toList());

        // Ánh xạ đệ quy các danh mục con
        List<CategoryDTO> childDTOs = children.stream()
                .map(child -> convertToTreeDTO(child, allCategories))
                .collect(Collectors.toList());

        // Thêm danh sách con vào DTO hiện tại
        dto.setChildren(childDTOs);

        return dto;
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