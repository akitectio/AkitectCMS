package io.akitect.cms.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Data;

@Data
public class PermissionDTO {
    private UUID id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
}