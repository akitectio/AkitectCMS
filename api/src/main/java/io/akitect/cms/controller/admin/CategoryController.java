package io.akitect.cms.controller.admin;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

import io.akitect.cms.dto.CategoryDTO;
import io.akitect.cms.model.Category;
import io.akitect.cms.repository.CategoryRepository;
import io.akitect.cms.util.CategoryMapper;
import io.akitect.cms.util.Constants;

@RestController
@RequestMapping(Constants.ADMIN_BASE_PATH + "/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<Category> categoriesPage = categoryRepository.findAll(pageable);

        // Convert entities to DTOs to prevent recursion issues
        List<CategoryDTO> categoryDTOs = categoriesPage.getContent().stream()
                .map(category -> {
                    CategoryDTO dto = new CategoryDTO();
                    dto.setId(category.getId());
                    dto.setName(category.getName());
                    dto.setSlug(category.getSlug());
                    dto.setDescription(category.getDescription());
                    dto.setMetaTitle(category.getMetaTitle());
                    dto.setMetaDescription(category.getMetaDescription());
                    dto.setFeatured(category.isFeatured());
                    dto.setDisplayOrder(category.getDisplayOrder());

                    // Only set parent ID reference, not the whole parent object
                    if (category.getParent() != null) {
                        dto.setParentId(category.getParent().getId());
                    }

                    return dto;
                })
                .collect(Collectors.toList());

        // Build response with pagination info
        Map<String, Object> response = new HashMap<>();
        response.put("categories", categoryDTOs);
        response.put("currentPage", categoriesPage.getNumber());
        response.put("totalItems", categoriesPage.getTotalElements());
        response.put("totalPages", categoriesPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    /**
     * Get a category by ID
     *
     * @param id Category ID
     * @return Category details if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable UUID id) {
        Optional<Category> categoryOpt = categoryRepository.findById(id);
        if (categoryOpt.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Category not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        Category category = categoryOpt.get();

        // Chuyển đổi entity thành DTO để tránh lỗi lazy loading và vòng lặp vô hạn
        CategoryDTO categoryDTO = new CategoryDTO();
        categoryDTO.setId(category.getId());
        categoryDTO.setName(category.getName());
        categoryDTO.setSlug(category.getSlug());
        categoryDTO.setDescription(category.getDescription());
        categoryDTO.setMetaTitle(category.getMetaTitle());
        categoryDTO.setMetaDescription(category.getMetaDescription());
        categoryDTO.setFeatured(category.isFeatured());
        categoryDTO.setDisplayOrder(category.getDisplayOrder());

        // Chỉ lấy ID của parent nếu có, không lấy toàn bộ đối tượng
        if (category.getParent() != null) {
            categoryDTO.setParentId(category.getParent().getId());
        }

        return ResponseEntity.ok(categoryDTO);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<?> createCategory(@RequestBody Category category) {
        // Check if the slug already exists
        Category existingCategory = categoryRepository.findBySlug(category.getSlug());
        if (existingCategory != null) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Slug already exists");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(categoryRepository.save(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable UUID id, @RequestBody Category categoryDetails) {
        Optional<Category> optionalCategory = categoryRepository.findById(id);
        if (optionalCategory.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Check if the slug already exists for a different category
        if (categoryRepository.existsBySlugAndIdNot(categoryDetails.getSlug(), id)) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Slug already exists");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }

        Category category = optionalCategory.get();
        category.setName(categoryDetails.getName());
        category.setSlug(categoryDetails.getSlug());
        category.setDescription(categoryDetails.getDescription());
        category.setMetaTitle(categoryDetails.getMetaTitle());
        category.setMetaDescription(categoryDetails.getMetaDescription());
        category.setFeatured(categoryDetails.isFeatured());
        category.setDisplayOrder(categoryDetails.getDisplayOrder());

        // Update parent if provided
        if (categoryDetails.getParent() != null) {
            // Prevent circular references by ensuring a category can't be its own parent
            if (id.equals(categoryDetails.getParent().getId())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "A category cannot be its own parent");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            // Verify parent exists
            Optional<Category> parentCategory = categoryRepository.findById(categoryDetails.getParent().getId());
            if (parentCategory.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Parent category not found");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            category.setParent(parentCategory.get());
        } else {
            category.setParent(null);
        }

        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable UUID id) {
        categoryRepository.deleteById(id);
    }

    /**
     * Get all categories as a tree structure without pagination
     * 
     * @return ResponseEntity containing all categories in hierarchical form
     */
    @GetMapping("/tree")
    public ResponseEntity<Map<String, Object>> getAllCategoriesAsTree() {
        // Find all categories with eager loading of children to ensure proper hierarchy
        // building
        List<Category> allCategories = categoryRepository.findAll(Sort.by("displayOrder"));

        // Convert to DTO tree structure using the improved mapper
        List<CategoryDTO> categoryTree = CategoryMapper.toCategoryTreeDTOs(allCategories);

        // Create response map
        Map<String, Object> response = new HashMap<>();
        response.put("categories", categoryTree);

        return ResponseEntity.ok(response);
    }

    /**
     * Search categories for Select2 components
     * 
     * @param q    Search query string
     * @param page Page number (optional, zero-based)
     * @param size Page size (optional)
     * @return List of matching categories formatted for Select2
     */
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchCategories(
            @RequestParam String q,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {

        Map<String, Object> response = new HashMap<>();

        // If size is 0 or less, return all matching categories without pagination
        if (size <= 0) {
            // Return all matching categories
            List<Category> categories = categoryRepository.findByNameContainingIgnoreCase(q);
            List<Map<String, Object>> results = categories.stream()
                    .map(category -> {
                        Map<String, Object> result = new HashMap<>();
                        result.put("id", category.getId().toString());
                        result.put("text", category.getName());
                        return result;
                    })
                    .collect(Collectors.toList());

            response.put("results", results);
        } else {
            // Return paginated results
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "name"));
            Page<Category> categoryPage = categoryRepository.findByNameContainingIgnoreCase(q, pageable);

            List<Map<String, Object>> results = categoryPage.getContent().stream()
                    .map(category -> {
                        Map<String, Object> result = new HashMap<>();
                        result.put("id", category.getId().toString());
                        result.put("text", category.getName());
                        return result;
                    })
                    .collect(Collectors.toList());

            response.put("results", results);
            response.put("pagination", Map.of(
                    "more", categoryPage.hasNext()));
        }

        return ResponseEntity.ok(response);
    }
}