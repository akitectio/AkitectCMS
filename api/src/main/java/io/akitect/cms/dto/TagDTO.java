package io.akitect.cms.dto;

import io.akitect.cms.model.Tag;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TagDTO {
    private String id;
    private String name;
    private String slug;
    private String description;
    private String createdAt;
    private String updatedAt;

    public static TagDTO fromEntity(Tag tag) {
        TagDTO dto = new TagDTO();
        dto.setId(tag.getId().toString()); // Convert UUID to String
        dto.setName(tag.getName());
        dto.setSlug(tag.getSlug());
        dto.setDescription(tag.getDescription());
        dto.setCreatedAt(tag.getCreatedAt().toString());
        dto.setUpdatedAt(tag.getUpdatedAt().toString());
        return dto;
    }
}