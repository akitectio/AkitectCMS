package io.akitect.cms.dto;

import java.util.Set;
import java.util.UUID;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoleUpdateDTO {
    @Size(min = 3, max = 50, message = "Role name must be between 3 and 50 characters")
    private String name;

    private String description;

    private Set<UUID> permissionIds;
}