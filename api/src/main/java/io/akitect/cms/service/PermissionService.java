package io.akitect.cms.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import io.akitect.cms.model.Permission;
import io.akitect.cms.repository.PermissionRepository;
import jakarta.persistence.criteria.Predicate;

@Service
public class PermissionService {

    @Autowired
    private PermissionRepository permissionRepository;

    /**
     * Get all permissions with search and filtering
     * 
     * @param search   Search term for name or description
     * @param pageable Pagination information
     * @return Page of permissions
     */
    public Page<Permission> getAllPermissions(String search, Pageable pageable) {
        Specification<Permission> spec = buildSearchSpecification(search);
        return permissionRepository.findAll(spec, pageable);
    }

    /**
     * Build specification for searching permissions
     * 
     * @param search Search term
     * @return Specification for search criteria
     */
    private Specification<Permission> buildSearchSpecification(String search) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(search)) {
                String searchLike = "%" + search.toLowerCase() + "%";
                predicates.add(
                        criteriaBuilder.or(
                                criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchLike),
                                criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), searchLike)));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

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