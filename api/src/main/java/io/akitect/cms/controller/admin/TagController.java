package io.akitect.cms.controller.admin;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
import org.springframework.web.bind.annotation.RestController;

import io.akitect.cms.dto.TagCreateDTO;
import io.akitect.cms.dto.TagDTO;
import io.akitect.cms.dto.TagUpdateDTO;
import io.akitect.cms.model.Tag;
import io.akitect.cms.service.TagService;
import io.akitect.cms.util.Constants;
import io.akitect.cms.util.PageableUtil;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping(Constants.ADMIN_BASE_PATH + "/tags")
@RequiredArgsConstructor
public class TagController extends AdminBaseController {

    private final TagService tagService;

    @GetMapping
    @Operation(summary = "Get all tags", description = "Returns a paginated list of all tags")
    public ResponseEntity<Map<String, Object>> getAllTags(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Pageable pageable = PageableUtil.createPageRequest(page, size, sortBy, direction);
        Page<Tag> tagPage = tagService.getAllTags(pageable);

        List<TagDTO> tagDTOs = tagPage.getContent().stream()
                .map(TagDTO::fromEntity)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("tags", tagDTOs);
        response.put("currentPage", tagPage.getNumber());
        response.put("totalItems", tagPage.getTotalElements());
        response.put("totalPages", tagPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    @Operation(summary = "Get all tags without pagination", description = "Returns a list of all tags without pagination")
    public ResponseEntity<Map<String, Object>> getAllTagsWithoutPagination() {
        List<Tag> tags = tagService.getAllTags();

        List<TagDTO> tagDTOs = tags.stream()
                .map(TagDTO::fromEntity)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("tags", tagDTOs);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get tag by ID", description = "Returns a single tag by its ID")
    public ResponseEntity<TagDTO> getTagById(@PathVariable String id) {
        Tag tag = tagService.getTagById(id);
        return ResponseEntity.ok(TagDTO.fromEntity(tag));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get tag by slug", description = "Returns a single tag by its slug")
    public ResponseEntity<TagDTO> getTagBySlug(@PathVariable String slug) {
        Tag tag = tagService.getTagBySlug(slug);
        return ResponseEntity.ok(TagDTO.fromEntity(tag));
    }

    @PostMapping
    @Operation(summary = "Create a new tag", description = "Creates a new tag with the provided information")
    public ResponseEntity<TagDTO> createTag(@Valid @RequestBody TagCreateDTO tagCreateDTO) {
        Tag createdTag = tagService.createTag(tagCreateDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(TagDTO.fromEntity(createdTag));
    }

    @PostMapping("/create-if-not-exists")
    @Operation(summary = "Create a tag if it doesn't exist", description = "Creates a new tag if it doesn't already exist")
    public ResponseEntity<TagDTO> createTagIfNotExists(@RequestParam @NotBlank String name) {
        Tag tag = tagService.createTagIfNotExists(name);
        return ResponseEntity.status(HttpStatus.CREATED).body(TagDTO.fromEntity(tag));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a tag", description = "Updates an existing tag with the provided information")
    public ResponseEntity<TagDTO> updateTag(
            @PathVariable String id,
            @Valid @RequestBody TagUpdateDTO tagUpdateDTO) {
        Tag updatedTag = tagService.updateTag(id, tagUpdateDTO);
        return ResponseEntity.ok(TagDTO.fromEntity(updatedTag));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a tag", description = "Deletes a tag by its ID")
    public ResponseEntity<Void> deleteTag(@PathVariable String id) {
        tagService.deleteTag(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Search tags", description = "Search tags by name or slug")
    public ResponseEntity<Map<String, Object>> searchTags(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        if (page < 0)
            page = 0;

        Map<String, Object> response = new HashMap<>();

        if (size <= 0) {
            // Return all matching tags without pagination
            List<Tag> tags = tagService.searchTags(q);
            List<TagDTO> tagDTOs = tags.stream()
                    .map(TagDTO::fromEntity)
                    .collect(Collectors.toList());

            response.put("tags", tagDTOs);
        } else {
            // Return paginated results
            Pageable pageable = PageableUtil.createPageRequest(page, size, "name", "asc");
            Page<Tag> tagPage = tagService.searchTags(q, pageable);

            List<TagDTO> tagDTOs = tagPage.getContent().stream()
                    .map(TagDTO::fromEntity)
                    .collect(Collectors.toList());

            response.put("tags", tagDTOs);
            response.put("currentPage", tagPage.getNumber());
            response.put("totalItems", tagPage.getTotalElements());
            response.put("totalPages", tagPage.getTotalPages());
        }

        return ResponseEntity.ok(response);
    }
}