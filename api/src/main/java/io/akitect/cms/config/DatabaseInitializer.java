package io.akitect.cms.config;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import io.akitect.cms.model.Permission;
import io.akitect.cms.model.Role;
import io.akitect.cms.model.User;
import io.akitect.cms.repository.PermissionRepository;
import io.akitect.cms.repository.RoleRepository;
import io.akitect.cms.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class DatabaseInitializer {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    @Transactional
    public void initialize() {
        log.info("Initializing database with default roles and permissions...");
        createDefaultPermissions();
        createDefaultRoles();
        createDefaultUsers();
        log.info("Database initialization complete.");
    }

    private void createDefaultUsers() {
        if (userRepository.count() == 0) {
            log.info("Creating default admin user...");

            // Create default admin user
            User adminUser = new User();
            adminUser.setUsername("admin");
            adminUser.setEmail("tdduy.dev@gmail.com");
            adminUser.setPassword(passwordEncoder.encode("123456"));
            adminUser.setFullName("Admin User");
            adminUser.setStatus("ACTIVE");
            adminUser.setEmailVerified(true);
            adminUser.setSuperAdmin(true);
            adminUser.setCreatedAt(LocalDateTime.now());
            adminUser.setUpdatedAt(LocalDateTime.now());

            // Assign ADMIN role
            Role adminRole = roleRepository.findByName("ADMIN")
                    .orElseThrow(() -> new RuntimeException("Error: Admin role not found."));
            adminUser.setRoles(new HashSet<>(Set.of(adminRole)));

            userRepository.save(adminUser);
            log.info("Default admin user created successfully.");
        }
    }

    private void createDefaultPermissions() {
        if (permissionRepository.count() == 0) {
            log.info("Creating default permissions...");
            String[] permissionNames = {
                    "user:read", "user:write", "user:delete",
                    "post:read", "post:write", "post:delete",
                    "category:read", "category:write", "category:delete",
                    "series:read", "series:write", "series:delete",
                    "lesson:read", "lesson:write", "lesson:delete",
                    "comment:read", "comment:write", "comment:delete",
                    "media:read", "media:write", "media:delete",
                    "configuration:read", "configuration:write",
                    "role:read", "role:write", "role:delete",
                    "permission:read", "permission:write", "permission:delete"
            };

            for (String name : permissionNames) {
                Permission permission = new Permission();
                permission.setName(name);
                permission.setDescription("Permission to " + name.replace(":", " "));
                permission.setCreatedAt(LocalDateTime.now());
                permissionRepository.save(permission);
            }
        }
    }

    private void createDefaultRoles() {
        if (roleRepository.count() == 0) {
            log.info("Creating default roles...");

            // Admin role
            Role adminRole = createRole("ADMIN", "Administrator with full access");
            Set<Permission> adminPermissions = new HashSet<>(permissionRepository.findAll());
            adminRole.setPermissions(adminPermissions);
            roleRepository.save(adminRole);

            // Editor role
            Role editorRole = createRole("EDITOR", "Can manage content but not system settings");
            Set<Permission> editorPermissions = new HashSet<>(permissionRepository.findAllByNameIn(Arrays.asList(
                    "post:read", "post:write", "post:delete",
                    "category:read", "category:write",
                    "series:read", "series:write",
                    "lesson:read", "lesson:write",
                    "comment:read", "comment:write", "comment:delete",
                    "media:read", "media:write", "media:delete")));
            editorRole.setPermissions(editorPermissions);
            roleRepository.save(editorRole);

            // Author role
            Role authorRole = createRole("AUTHOR", "Can create and edit own content");
            Set<Permission> authorPermissions = new HashSet<>(permissionRepository.findAllByNameIn(Arrays.asList(
                    "post:read", "post:write",
                    "category:read",
                    "series:read", "series:write",
                    "lesson:read", "lesson:write",
                    "comment:read", "comment:write",
                    "media:read", "media:write")));
            authorRole.setPermissions(authorPermissions);
            roleRepository.save(authorRole);

            // User role
            Role userRole = createRole("USER", "Regular user with limited access");
            Set<Permission> userPermissions = new HashSet<>(permissionRepository.findAllByNameIn(Arrays.asList(
                    "post:read",
                    "category:read",
                    "series:read",
                    "lesson:read",
                    "comment:read", "comment:write")));
            userRole.setPermissions(userPermissions);
            roleRepository.save(userRole);
        }
    }

    private Role createRole(String name, String description) {
        Role role = new Role();
        role.setName(name);
        role.setDescription(description);
        role.setCreatedAt(LocalDateTime.now());
        role.setUpdatedAt(LocalDateTime.now());
        return role;
    }
}