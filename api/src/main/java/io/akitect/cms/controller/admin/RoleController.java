package io.akitect.cms.controller.admin;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import io.akitect.cms.dto.MessageResponse;
import io.akitect.cms.dto.RoleCreateDTO;
import io.akitect.cms.dto.RoleDTO;
import io.akitect.cms.dto.RoleUpdateDTO;
import io.akitect.cms.service.RoleService;
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
@RequestMapping(Constants.ADMIN_BASE_PATH + "/roles")
@Tag(name = "Role Management", description = "APIs for managing roles in the system")
public class RoleController extends AdminBaseController {

        @Autowired
        private RoleService roleService;

        /**
         * Get all roles with pagination, search and filter
         * 
         * @param page      Page number
         * @param size      Page size
         * @param search    Search term for name or description
         * @param sortBy    Field to sort by
         * @param direction Sort direction
         * @return Paginated list of roles
         */
        @GetMapping
        @PreAuthorize("hasAuthority('role:read')")
        @Operation(summary = "Get all roles", description = "Get a paginated list of roles with search and filter options")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully retrieved roles list"),
                        @ApiResponse(responseCode = "401", description = "You are not authorized to view the resource"),
                        @ApiResponse(responseCode = "403", description = "Accessing the resource you were trying to reach is forbidden"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<Map<String, Object>> getAllRoles(
                        @Parameter(description = "Page number (zero-based)") @RequestParam(defaultValue = "0") int page,
                        @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int size,
                        @Parameter(description = "Search term for name or description") @RequestParam(required = false) String search,
                        @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "name") String sortBy,
                        @Parameter(description = "Sort direction (asc or desc)") @RequestParam(defaultValue = "asc") String direction) {

                // Validate sort field to prevent SQL injection
                if (!sortBy.matches("^[a-zA-Z0-9_]*$")) {
                        sortBy = "name";
                }

                Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC
                                : Sort.Direction.ASC;
                Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

                Page<RoleDTO> rolesPage = roleService.getAllRoles(search, pageable);

                Map<String, Object> response = new HashMap<>();
                response.put("roles", rolesPage.getContent());
                response.put("currentPage", rolesPage.getNumber());
                response.put("totalItems", rolesPage.getTotalElements());
                response.put("totalPages", rolesPage.getTotalPages());

                return ResponseEntity.ok(response);
        }

        /**
         * Get role by ID
         * 
         * @param id Role ID
         * @return Role details
         */
        @GetMapping("/{id}")
        @PreAuthorize("hasAuthority('role:read')")
        @Operation(summary = "Get role by ID", description = "Get a role by its ID")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully retrieved role"),
                        @ApiResponse(responseCode = "404", description = "Role not found"),
                        @ApiResponse(responseCode = "401", description = "You are not authorized to view the resource"),
                        @ApiResponse(responseCode = "403", description = "Accessing the resource you were trying to reach is forbidden"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<RoleDTO> getRoleById(
                        @Parameter(description = "Role ID", required = true) @PathVariable UUID id) {
                RoleDTO role = roleService.getRoleById(id);
                return ResponseEntity.ok(role);
        }

        /**
         * Create a new role
         * 
         * @param roleCreateDTO Role creation data
         * @return Created role
         */
        @PostMapping
        @PreAuthorize("hasAuthority('role:write')")
        @ResponseStatus(HttpStatus.CREATED)
        @Operation(summary = "Create new role", description = "Create a new role in the system")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Successfully created role", content = @Content(mediaType = "application/json", schema = @Schema(implementation = RoleDTO.class))),
                        @ApiResponse(responseCode = "400", description = "Invalid input or role name already exists"),
                        @ApiResponse(responseCode = "401", description = "You are not authorized to create the resource"),
                        @ApiResponse(responseCode = "403", description = "Accessing the resource you were trying to reach is forbidden"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<RoleDTO> createRole(@Valid @RequestBody RoleCreateDTO roleCreateDTO) {
                RoleDTO createdRole = roleService.createRole(roleCreateDTO);
                return ResponseEntity.status(HttpStatus.CREATED).body(createdRole);
        }

        /**
         * Update an existing role
         * 
         * @param id            Role ID
         * @param roleUpdateDTO Updated role data
         * @return Updated role
         */
        @PutMapping("/{id}")
        @PreAuthorize("hasAuthority('role:write')")
        @Operation(summary = "Update role", description = "Update an existing role in the system")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully updated role", content = @Content(mediaType = "application/json", schema = @Schema(implementation = RoleDTO.class))),
                        @ApiResponse(responseCode = "400", description = "Invalid input or role name already exists"),
                        @ApiResponse(responseCode = "404", description = "Role not found"),
                        @ApiResponse(responseCode = "401", description = "You are not authorized to update the resource"),
                        @ApiResponse(responseCode = "403", description = "Accessing the resource you were trying to reach is forbidden"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<RoleDTO> updateRole(
                        @Parameter(description = "Role ID", required = true) @PathVariable UUID id,
                        @Valid @RequestBody RoleUpdateDTO roleUpdateDTO) {
                RoleDTO updatedRole = roleService.updateRole(id, roleUpdateDTO);
                return ResponseEntity.ok(updatedRole);
        }

        /**
         * Delete a role
         * 
         * @param id Role ID
         * @return Success message
         */
        @DeleteMapping("/{id}")
        @PreAuthorize("hasAuthority('role:delete')")
        @Operation(summary = "Delete role", description = "Delete an existing role in the system")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Successfully deleted role"),
                        @ApiResponse(responseCode = "400", description = "Role cannot be deleted because it is in use"),
                        @ApiResponse(responseCode = "404", description = "Role not found"),
                        @ApiResponse(responseCode = "401", description = "You are not authorized to delete the resource"),
                        @ApiResponse(responseCode = "403", description = "Accessing the resource you were trying to reach is forbidden"),
                        @ApiResponse(responseCode = "500", description = "Internal server error")
        })
        public ResponseEntity<MessageResponse> deleteRole(
                        @Parameter(description = "Role ID", required = true) @PathVariable UUID id) {
                roleService.deleteRole(id);
                return ResponseEntity.ok(MessageResponse.success("Role deleted successfully"));
        }
}