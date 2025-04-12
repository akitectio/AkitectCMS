package io.akitect.cms.controller.admin;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.akitect.cms.model.User;
import io.akitect.cms.repository.UserRepository;
import io.akitect.cms.security.UserDetailsImpl;
import io.akitect.cms.util.Constants;

@RestController
@RequestMapping(Constants.ADMIN_BASE_PATH + "/users") // Use centralized constant for base path
public class UserController extends AdminBaseController {

    @Autowired
    private UserRepository userRepository;

    /**
     * Get current user profile information
     * 
     * @param userDetails The authenticated user details
     * @return User profile data
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("fullName", user.getFullName());
        response.put("avatarUrl", user.getAvatarUrl());
        response.put("bio", user.getBio());
        response.put("status", user.getStatus());
        response.put("emailVerified", user.isEmailVerified());
        response.put("lastLogin", user.getLastLogin());
        response.put("superAdmin", user.isSuperAdmin());
        response.put("createdAt", user.getCreatedAt());
        response.put("updatedAt", user.getUpdatedAt());

        // Add roles without circular references
        response.put("roles", user.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.toList()));

        // Add permissions to allow frontend permission checks
        Set<String> permissions = new HashSet<>();
        user.getRoles().forEach(role -> {
            role.getPermissions().forEach(permission -> {
                permissions.add(permission.getName());
            });
        });
        response.put("permissions", permissions);

        return ResponseEntity.ok(response);
    }
}
