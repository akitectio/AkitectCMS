package io.akitect.cms.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import io.akitect.cms.dto.RoleCreateDTO;
import io.akitect.cms.dto.RoleDTO;
import io.akitect.cms.dto.RoleUpdateDTO;
import io.akitect.cms.model.Permission;
import io.akitect.cms.model.Role;
import io.akitect.cms.repository.PermissionRepository;
import io.akitect.cms.repository.RoleRepository;
import jakarta.persistence.criteria.Predicate;

@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    /**
     * Get all roles with search and pagination
     * 
     * @param search   Search term for name or description
     * @param pageable Pagination information
     * @return Page of RoleDTO
     */
    public Page<RoleDTO> getAllRoles(String search, Pageable pageable) {
        Specification<Role> spec = buildSearchSpecification(search);
        Page<Role> rolesPage = roleRepository.findAll(spec, pageable);

        return rolesPage.map(this::convertToDTO);
    }

    /**
     * Build specification for searching roles
     * 
     * @param search Search term
     * @return Specification for search criteria
     */
    private Specification<Role> buildSearchSpecification(String search) {
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
     * Get all roles without pagination
     * (keeping for backward compatibility)
     * 
     * @return List of all roles
     */
    public List<RoleDTO> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get role by ID
     * 
     * @param id Role ID
     * @return Role DTO
     */
    public RoleDTO getRoleById(UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found with id: " + id));
        return convertToDTO(role);
    }

    /**
     * Create a new role
     * 
     * @param roleCreateDTO Role creation data
     * @return Created role DTO
     */
    @Transactional
    public RoleDTO createRole(RoleCreateDTO roleCreateDTO) {
        // Kiểm tra xem role name đã tồn tại chưa
        if (roleRepository.findByName(roleCreateDTO.getName()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role name already exists");
        }

        Role role = new Role();
        role.setName(roleCreateDTO.getName());
        role.setDescription(roleCreateDTO.getDescription());
        role.setCreatedAt(LocalDateTime.now());
        role.setUpdatedAt(LocalDateTime.now());

        // Set permissions if provided
        if (roleCreateDTO.getPermissionIds() != null && !roleCreateDTO.getPermissionIds().isEmpty()) {
            Set<Permission> permissions = new HashSet<>();
            for (UUID permissionId : roleCreateDTO.getPermissionIds()) {
                Permission permission = permissionRepository.findById(permissionId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Permission not found with id: " + permissionId));
                permissions.add(permission);
            }
            role.setPermissions(permissions);
        }

        Role savedRole = roleRepository.save(role);
        return convertToDTO(savedRole);
    }

    /**
     * Update an existing role
     * 
     * @param id            Role ID
     * @param roleUpdateDTO Role update data
     * @return Updated role DTO
     */
    @Transactional
    public RoleDTO updateRole(UUID id, RoleUpdateDTO roleUpdateDTO) {
        Role existingRole = roleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found with id: " + id));

        // Kiểm tra nếu tên role mới đã tồn tại (và không phải là role hiện tại)
        if (roleUpdateDTO.getName() != null && !roleUpdateDTO.getName().equals(existingRole.getName())) {
            roleRepository.findByName(roleUpdateDTO.getName())
                    .ifPresent(r -> {
                        if (!r.getId().equals(id)) {
                            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role name already exists");
                        }
                    });
            existingRole.setName(roleUpdateDTO.getName());
        }

        if (roleUpdateDTO.getDescription() != null) {
            existingRole.setDescription(roleUpdateDTO.getDescription());
        }

        // Update permissions if provided
        if (roleUpdateDTO.getPermissionIds() != null) {
            Set<Permission> permissions = new HashSet<>();
            for (UUID permissionId : roleUpdateDTO.getPermissionIds()) {
                Permission permission = permissionRepository.findById(permissionId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Permission not found with id: " + permissionId));
                permissions.add(permission);
            }
            existingRole.setPermissions(permissions);
        }

        existingRole.setUpdatedAt(LocalDateTime.now());
        Role updatedRole = roleRepository.save(existingRole);
        return convertToDTO(updatedRole);
    }

    /**
     * Delete a role
     * 
     * @param id Role ID
     */
    @Transactional
    public void deleteRole(UUID id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Role not found with id: " + id));

        // Kiểm tra xem role có đang được sử dụng bởi bất kỳ user nào không
        if (!role.getUsers().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Cannot delete role because it is assigned to users");
        }

        roleRepository.delete(role);
    }

    /**
     * Convert Role entity to DTO
     * 
     * @param role Role entity
     * @return Role DTO
     */
    private RoleDTO convertToDTO(Role role) {
        RoleDTO dto = new RoleDTO();
        dto.setId(role.getId());
        dto.setName(role.getName());
        dto.setDescription(role.getDescription());
        dto.setCreatedAt(role.getCreatedAt());
        dto.setUpdatedAt(role.getUpdatedAt());

        if (role.getPermissions() != null) {
            dto.setPermissionIds(role.getPermissions().stream()
                    .map(Permission::getId)
                    .collect(Collectors.toSet()));
        }

        return dto;
    }
}