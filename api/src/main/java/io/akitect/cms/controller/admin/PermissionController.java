package io.akitect.cms.controller.admin;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import io.akitect.cms.dto.MessageResponse;
import io.akitect.cms.dto.PermissionCreateDTO;
import io.akitect.cms.dto.PermissionDTO;
import io.akitect.cms.dto.PermissionUpdateDTO;
import io.akitect.cms.model.Permission;
import io.akitect.cms.repository.PermissionRepository;
import io.akitect.cms.service.PermissionService;
import io.akitect.cms.util.Constants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping(Constants.ADMIN_BASE_PATH + "/permissions")
@PreAuthorize("hasAuthority('user:write')")
@Tag(name = "Permission Management", description = "APIs for managing permissions in the system")
public class PermissionController extends AdminBaseController {

    @Autowired
    private PermissionService permissionService;

    @Autowired
    private PermissionRepository permissionRepository;

    /**
     * Get all permissions with pagination
     * 
     * @param page      Page number
     * @param size      Page size
     * @param sortBy    Sort field
     * @param direction Sort direction
     * @return List of permissions
     */
    @GetMapping
    @Operation(summary = "Get all permissions", description = "Retrieve a paginated list of all permissions")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved permissions list"),
            @ApiResponse(responseCode = "401", description = "You are not authorized to view the resource"),
            @ApiResponse(responseCode = "403", description = "Accessing the resource you were trying to reach is forbidden"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Object>> getAllPermissions(
            @Parameter(description = "Page number (zero-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "name") String sortBy,
            @Parameter(description = "Sort direction (asc or desc)") @RequestParam(defaultValue = "asc") String direction) {

        try {
            // Validate sort field to prevent SQL injection
            if (!sortBy.matches("^[a-zA-Z0-9_]*$")) {
                sortBy = "name";
            }

            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC
                    : Sort.Direction.ASC;

            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
            Page<Permission> permissionsPage = permissionService.getAllPermissions(pageable);

            List<PermissionDTO> permissions = permissionsPage.getContent().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("permissions", permissions);
            response.put("currentPage", permissionsPage.getNumber());
            response.put("totalItems", permissionsPage.getTotalElements());
            response.put("totalPages", permissionsPage.getTotalPages());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error retrieving permissions", e);
        }
    }

    /**
     * Get a permission by ID
     * 
     * @param id Permission ID
     * @return Permission details
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get permission by ID", description = "Get detailed information about a specific permission")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved permission details", content = @Content(mediaType = "application/json", schema = @Schema(implementation = PermissionDTO.class))),
            @ApiResponse(responseCode = "404", description = "Permission not found"),
            @ApiResponse(responseCode = "401", description = "You are not authorized to view the resource"),
            @ApiResponse(responseCode = "403", description = "Accessing the resource you were trying to reach is forbidden")
    })
    public ResponseEntity<PermissionDTO> getPermissionById(
            @Parameter(description = "Permission ID", required = true) @PathVariable UUID id) {
        Permission permission = permissionService.getPermissionById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permission not found"));

        return ResponseEntity.ok(convertToDTO(permission));
    }

    /**
     * Create a new permission
     * 
     * @param permissionCreateDTO Permission data
     * @return Created permission
     */
    @PostMapping
    @Operation(summary = "Create a new permission", description = "Create a new permission in the system")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Permission successfully created", content = @Content(mediaType = "application/json", schema = @Schema(implementation = PermissionDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input or permission name already exists"),
            @ApiResponse(responseCode = "401", description = "You are not authorized to create permissions"),
            @ApiResponse(responseCode = "403", description = "Accessing the resource you were trying to reach is forbidden"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PreAuthorize("hasAuthority('user:write')")
    public ResponseEntity<PermissionDTO> createPermission(
            @Parameter(description = "Permission creation data", required = true) @Valid @RequestBody PermissionCreateDTO permissionCreateDTO) {
        try {
            // Check if permission with the same name already exists
            if (permissionRepository.findAllByNameIn(List.of(permissionCreateDTO.getName())).size() > 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Permission with this name already exists");
            }

            Permission permission = new Permission();
            permission.setName(permissionCreateDTO.getName());
            permission.setDescription(permissionCreateDTO.getDescription());
            permission.setCreatedAt(LocalDateTime.now());

            Permission savedPermission = permissionService.createPermission(permission);

            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedPermission));
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error creating permission", e);
        }
    }

    /**
     * Update an existing permission
     * 
     * @param id                  Permission ID
     * @param permissionUpdateDTO Updated permission data
     * @return Updated permission
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update a permission", description = "Update an existing permission")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Permission successfully updated", content = @Content(mediaType = "application/json", schema = @Schema(implementation = PermissionDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input or permission name already exists"),
            @ApiResponse(responseCode = "404", description = "Permission not found"),
            @ApiResponse(responseCode = "401", description = "You are not authorized to update permissions"),
            @ApiResponse(responseCode = "403", description = "Accessing the resource you were trying to reach is forbidden"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PreAuthorize("hasAuthority('user:write')")
    public ResponseEntity<PermissionDTO> updatePermission(
            @Parameter(description = "Permission ID", required = true) @PathVariable UUID id,
            @Parameter(description = "Updated permission data", required = true) @Valid @RequestBody PermissionUpdateDTO permissionUpdateDTO) {

        try {
            Permission permission = permissionService.getPermissionById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permission not found"));

            // Check if another permission with the same name exists
            List<Permission> existingPermissions = permissionRepository
                    .findAllByNameIn(List.of(permissionUpdateDTO.getName()));
            if (!existingPermissions.isEmpty() && !existingPermissions.get(0).getId().equals(id)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Another permission with this name already exists");
            }

            permission.setName(permissionUpdateDTO.getName());
            permission.setDescription(permissionUpdateDTO.getDescription());

            Permission updatedPermission = permissionService.updatePermission(id, permission);

            return ResponseEntity.ok(convertToDTO(updatedPermission));
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error updating permission", e);
        }
    }

    /**
     * Delete a permission
     * 
     * @param id Permission ID
     * @return Success message
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a permission", description = "Delete an existing permission")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Permission successfully deleted"),
            @ApiResponse(responseCode = "404", description = "Permission not found"),
            @ApiResponse(responseCode = "401", description = "You are not authorized to delete permissions"),
            @ApiResponse(responseCode = "403", description = "Accessing the resource you were trying to reach is forbidden"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PreAuthorize("hasAuthority('user:write')")
    public ResponseEntity<MessageResponse> deletePermission(
            @Parameter(description = "Permission ID", required = true) @PathVariable UUID id) {
        try {
            permissionService.deletePermission(id);
            return ResponseEntity.ok(MessageResponse.success("Permission deleted successfully"));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error deleting permission", e);
        }
    }

    /**
     * Get all roles associated with a permission
     * 
     * @param id Permission ID
     * @return List of role names
     */
    @GetMapping("/{id}/roles")
    @Operation(summary = "Get roles for a permission", description = "Get all roles that have this permission")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved roles list"),
            @ApiResponse(responseCode = "404", description = "Permission not found"),
            @ApiResponse(responseCode = "401", description = "You are not authorized to view the resource"),
            @ApiResponse(responseCode = "403", description = "Accessing the resource you were trying to reach is forbidden"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> getPermissionRoles(
            @Parameter(description = "Permission ID", required = true) @PathVariable UUID id) {
        try {
            Permission permission = permissionService.getPermissionById(id)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Permission not found"));

            List<String> roles = permission.getRoles().stream()
                    .map(role -> role.getName())
                    .collect(Collectors.toList());

            return ResponseEntity.ok(roles);
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error retrieving roles for permission",
                    e);
        }
    }

    /**
     * Convert Permission entity to DTO
     * 
     * @param permission Permission entity
     * @return Permission DTO
     */
    private PermissionDTO convertToDTO(Permission permission) {
        PermissionDTO dto = new PermissionDTO();
        dto.setId(permission.getId());
        dto.setName(permission.getName());
        dto.setDescription(permission.getDescription());
        dto.setCreatedAt(permission.getCreatedAt());
        return dto;
    }
}