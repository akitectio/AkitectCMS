package io.akitect.cms.dto;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoleDTO {
    private UUID id;
    private String name;
    private String description;
    private Set<UUID> permissionIds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}