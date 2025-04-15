package io.akitect.cms.dto;

import java.util.UUID;
import lombok.Data;

@Data
public class TagDTO {
    private UUID id;
    private String name;
    private String slug;
}