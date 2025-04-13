package io.akitect.cms.controller.admin;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
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
import io.akitect.cms.dto.UserCreateDTO;
import io.akitect.cms.model.Role;
import io.akitect.cms.model.User;
import io.akitect.cms.repository.RoleRepository;
import io.akitect.cms.repository.UserRepository;
import io.akitect.cms.security.UserDetailsImpl;
import io.akitect.cms.util.Constants;
import io.akitect.cms.util.enums.UserStatusEnum;
import jakarta.validation.Valid;

@RestController
@RequestMapping(Constants.ADMIN_BASE_PATH + "/users") // Use centralized constant for base path
public class UserController extends AdminBaseController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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
        response.put("roles", user.getRoles().stream().map(Role::getName).toList());

        // Add permissions to allow frontend permission checks
        Set<String> permissions = new HashSet<>();
        user.getRoles()
                .forEach(role -> role.getPermissions().forEach(permission -> permissions.add(permission.getName())));
        response.put("permissions", permissions);

        return ResponseEntity.ok(response);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<?> createUser(@Valid @RequestBody UserCreateDTO userCreateDTO) {
        // Check if username already exists
        if (userRepository.existsByUsername(userCreateDTO.getUsername())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(MessageResponse.error("Error: Username is already taken!"));
        }

        // Check if email already exists
        if (userRepository.existsByEmail(userCreateDTO.getEmail())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(MessageResponse.error("Error: Email is already in use!"));
        }

        // Check if roles exist and are valid
        if (userCreateDTO.getRoleIds() == null || userCreateDTO.getRoleIds().isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(MessageResponse.error("Error: User must have at least one role!"));
        }

        User user = new User();
        user.setUsername(userCreateDTO.getUsername());
        user.setEmail(userCreateDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userCreateDTO.getPassword())); // Encode password
        user.setFullName(userCreateDTO.getFullName());
        user.setStatus(UserStatusEnum.ACTIVE.getValue());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        // Assign roles to the user
        Set<Role> roles = new HashSet<>();
        for (UUID roleId : userCreateDTO.getRoleIds()) {
            Role role = roleRepository.findById(roleId)
                    .orElseThrow(() -> new RuntimeException("Error: Role with ID " + roleId + " not found!"));
            roles.add(role);
        }
        user.setRoles(roles);

        userRepository.save(user);

        // Return the user data without password and with simplified roles
        return ResponseEntity.status(HttpStatus.CREATED).body(convertUserToDTO(user));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) String search) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

        Page<User> userPage;
        if (search != null && !search.isEmpty()) {
            userPage = userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(search, search,
                    pageable);
        } else {
            userPage = userRepository.findAll(pageable);
        }

        // Convert users to DTOs without password and with only role names
        List<Map<String, Object>> userDTOs = userPage.getContent().stream()
                .map(user -> {
                    Map<String, Object> userDTO = new HashMap<>();
                    userDTO.put("id", user.getId());
                    userDTO.put("username", user.getUsername());
                    userDTO.put("email", user.getEmail());
                    userDTO.put("fullName", user.getFullName());
                    userDTO.put("avatarUrl", user.getAvatarUrl());
                    userDTO.put("bio", user.getBio());
                    userDTO.put("status", user.getStatus());
                    userDTO.put("emailVerified", user.isEmailVerified());
                    userDTO.put("lastLogin", user.getLastLogin());
                    userDTO.put("superAdmin", user.isSuperAdmin());
                    userDTO.put("createdAt", user.getCreatedAt());
                    userDTO.put("updatedAt", user.getUpdatedAt());

                    // Add roles without circular references (only role names)
                    userDTO.put("roles", user.getRoles().stream().map(Role::getName).toList());

                    return userDTO;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("users", userDTOs);
        response.put("currentPage", userPage.getNumber());
        response.put("totalItems", userPage.getTotalElements());
        response.put("totalPages", userPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> userDTO = new HashMap<>();
        userDTO.put("id", user.getId());
        userDTO.put("username", user.getUsername());
        userDTO.put("email", user.getEmail());
        userDTO.put("fullName", user.getFullName());
        userDTO.put("status", user.getStatus());
        userDTO.put("roles", user.getRoles().stream().map(Role::getName).toList());

        return ResponseEntity.ok(userDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable UUID id, @Valid @RequestBody UserCreateDTO userUpdateDTO) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));

        // Check if username is already taken by another user
        if (!user.getUsername().equals(userUpdateDTO.getUsername()) &&
                userRepository.existsByUsername(userUpdateDTO.getUsername())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(MessageResponse.error("Error: Username is already taken!"));
        }

        // Check if email is already used by another user
        if (!user.getEmail().equals(userUpdateDTO.getEmail()) &&
                userRepository.existsByEmail(userUpdateDTO.getEmail())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(MessageResponse.error("Error: Email is already in use!"));
        }

        // Check if roles exist and are valid
        if (userUpdateDTO.getRoleIds() == null || userUpdateDTO.getRoleIds().isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(MessageResponse.error("Error: User must have at least one role!"));
        }

        user.setUsername(userUpdateDTO.getUsername());
        user.setEmail(userUpdateDTO.getEmail());
        user.setFullName(userUpdateDTO.getFullName());
        user.setUpdatedAt(LocalDateTime.now());

        // Update user roles
        Set<Role> roles = new HashSet<>();
        for (UUID roleId : userUpdateDTO.getRoleIds()) {
            Role role = roleRepository.findById(roleId)
                    .orElseThrow(() -> new RuntimeException("Error: Role with ID " + roleId + " not found!"));
            roles.add(role);
        }
        user.setRoles(roles);

        userRepository.save(user);
        return ResponseEntity.ok(convertUserToDTO(user));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable UUID id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(id);
    }

    @PutMapping("/{id}/lock")
    public ResponseEntity<?> lockUser(@PathVariable UUID id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus("LOCKED");
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return ResponseEntity.ok(convertUserToDTO(user));
    }

    @PutMapping("/{id}/unlock")
    public ResponseEntity<?> unlockUser(@PathVariable UUID id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus("ACTIVE");
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return ResponseEntity.ok(convertUserToDTO(user));
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable UUID id, @RequestParam String newPassword) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword)); // Properly encode the password
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return ResponseEntity.ok(convertUserToDTO(user));
    }

    /**
     * Check if a username or email is already taken
     * 
     * @param username      The username to check (optional)
     * @param email         The email to check (optional)
     * @param excludeUserId User ID to exclude from check (for updates)
     * @return Response with availability status
     */
    @GetMapping("/check-availability")
    public ResponseEntity<?> checkAvailability(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) UUID excludeUserId) {

        Map<String, Boolean> response = new HashMap<>();

        if (username != null && !username.isEmpty()) {
            boolean isUsernameTaken;
            if (excludeUserId != null) {
                // For update scenario - exclude current user from check
                Optional<User> existingUser = userRepository.findByUsername(username);
                isUsernameTaken = existingUser.isPresent() && !existingUser.get().getId().equals(excludeUserId);
            } else {
                // For new user scenario
                isUsernameTaken = userRepository.existsByUsername(username);
            }
            response.put("usernameAvailable", !isUsernameTaken);
        }

        if (email != null && !email.isEmpty()) {
            boolean isEmailTaken;
            if (excludeUserId != null) {
                // For update scenario - exclude current user from check
                Optional<User> existingUser = userRepository.findByEmail(email);
                isEmailTaken = existingUser.isPresent() && !existingUser.get().getId().equals(excludeUserId);
            } else {
                // For new user scenario
                isEmailTaken = userRepository.existsByEmail(email);
            }
            response.put("emailAvailable", !isEmailTaken);
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Converts a User entity to a DTO map without password and with simplified
     * roles
     * 
     * @param user The user entity to convert
     * @return A map representing the user without sensitive information
     */
    private Map<String, Object> convertUserToDTO(User user) {
        Map<String, Object> userDTO = new HashMap<>();
        userDTO.put("id", user.getId());
        userDTO.put("username", user.getUsername());
        userDTO.put("email", user.getEmail());
        userDTO.put("fullName", user.getFullName());
        userDTO.put("avatarUrl", user.getAvatarUrl());
        userDTO.put("bio", user.getBio());
        userDTO.put("status", user.getStatus());
        userDTO.put("emailVerified", user.isEmailVerified());
        userDTO.put("lastLogin", user.getLastLogin());
        userDTO.put("superAdmin", user.isSuperAdmin());
        userDTO.put("createdAt", user.getCreatedAt());
        userDTO.put("updatedAt", user.getUpdatedAt());

        // Add roles without circular references (only role names)
        userDTO.put("roles", user.getRoles().stream().map(Role::getName).toList());

        return userDTO;
    }
}
