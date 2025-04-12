package io.akitect.cms.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import io.akitect.cms.model.Permission;
import io.akitect.cms.repository.PermissionRepository;

@Service
public class PermissionService {

    @Autowired
    private PermissionRepository permissionRepository;

    /**
     * Get all permissions
     * 
     * @return List of all permissions
     */
    public List<Permission> getAllPermissions() {
        return permissionRepository.findAll();
    }

    /**
     * Get all permissions with pagination
     * 
     * @param pageable Pagination information
     * @return Page of permissions
     */
    public Page<Permission> getAllPermissions(Pageable pageable) {
        return permissionRepository.findAll(pageable);
    }

    /**
     * Get permission by ID
     * 
     * @param id Permission ID
     * @return Permission if found
     */
    public Optional<Permission> getPermissionById(UUID id) {
        return permissionRepository.findById(id);
    }

    /**
     * Create a new permission
     * 
     * @param permission Permission to create
     * @return Created permission
     */
    public Permission createPermission(Permission permission) {
        permission.setCreatedAt(LocalDateTime.now());
        return permissionRepository.save(permission);
    }

    /**
     * Update an existing permission
     * 
     * @param id                Permission ID
     * @param permissionDetails Updated permission details
     * @return Updated permission
     */
    public Permission updatePermission(UUID id, Permission permissionDetails) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permission not found"));

        permission.setName(permissionDetails.getName());
        permission.setDescription(permissionDetails.getDescription());

        return permissionRepository.save(permission);
    }

    /**
     * Delete a permission
     * 
     * @param id Permission ID
     */
    public void deletePermission(UUID id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Permission not found"));

        // Clear relationship with roles to avoid constraint violations
        permission.getRoles().forEach(role -> role.getPermissions().remove(permission));
        permission.setRoles(null);

        permissionRepository.delete(permission);
    }
}