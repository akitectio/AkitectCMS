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
import io.akitect.cms.exception.UserNotFoundException;
import io.akitect.cms.model.Role;
import io.akitect.cms.model.User;
import io.akitect.cms.repository.ActivityLogRepository;
import io.akitect.cms.repository.RoleRepository;
import io.akitect.cms.repository.UserRepository;
import io.akitect.cms.security.UserDetailsImpl;
import io.akitect.cms.service.AuthService;
import io.akitect.cms.util.Constants;
import io.akitect.cms.util.enums.UserStatusEnum;
import jakarta.validation.Valid;

@RestController
@RequestMapping(Constants.ADMIN_BASE_PATH + "/users") // Use centralized constant for base path
public class UserController extends AdminBaseController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;
    private final ActivityLogRepository activityLogRepository;

    public UserController(UserRepository userRepository, RoleRepository roleRepository,
            PasswordEncoder passwordEncoder, AuthService authService,
            ActivityLogRepository activityLogRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authService = authService;
        this.activityLogRepository = activityLogRepository;
    }

    // Define constants for repeated string literals
    private static final String USER_NOT_FOUND = "User not found";
    private static final String USERNAME = "username";
    private static final String FULL_NAME = "fullName";
    private static final String AVATAR_URL = "avatarUrl";
    private static final String STATUS = "status";
    private static final String EMAIL_VERIFIED = "emailVerified";
    private static final String LAST_LOGIN = "lastLogin";
    private static final String SUPER_ADMIN = "superAdmin";
    private static final String CREATED_AT = "createdAt";
    private static final String UPDATED_AT = "updatedAt";
    private static final String ROLES = "roles";

    /**
     * Get current user profile information
     * 
     * @param userDetails The authenticated user details
     * @return User profile data
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException(USER_NOT_FOUND));

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put(USERNAME, user.getUsername());
        response.put("email", user.getEmail());
        response.put(FULL_NAME, user.getFullName());
        response.put(AVATAR_URL, user.getAvatarUrl());
        response.put("bio", user.getBio());
        response.put(STATUS, user.getStatus());
        response.put(EMAIL_VERIFIED, user.isEmailVerified());
        response.put(LAST_LOGIN, user.getLastLogin());
        response.put(SUPER_ADMIN, user.isSuperAdmin());
        response.put(CREATED_AT, user.getCreatedAt());
        response.put(UPDATED_AT, user.getUpdatedAt());

        // Add roles without circular references
        response.put(ROLES, user.getRoles().stream().map(Role::getName).toList());

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
                    userDTO.put(USERNAME, user.getUsername());
                    userDTO.put("email", user.getEmail());
                    userDTO.put(FULL_NAME, user.getFullName());
                    userDTO.put(AVATAR_URL, user.getAvatarUrl());
                    userDTO.put("bio", user.getBio());
                    userDTO.put(STATUS, user.getStatus());
                    userDTO.put(EMAIL_VERIFIED, user.isEmailVerified());
                    userDTO.put(LAST_LOGIN, user.getLastLogin());
                    userDTO.put(SUPER_ADMIN, user.isSuperAdmin());
                    userDTO.put(CREATED_AT, user.getCreatedAt());
                    userDTO.put(UPDATED_AT, user.getUpdatedAt());

                    // Add roles without circular references (only role names)
                    userDTO.put(ROLES, user.getRoles().stream().map(Role::getName).toList());

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
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        Map<String, Object> userDTO = convertUserToDTO(user);
        return ResponseEntity.ok(userDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable UUID id, @Valid @RequestBody UserCreateDTO userUpdateDTO) {
        User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));

        // Simplify boolean expressions
        if (!user.getUsername().equals(userUpdateDTO.getUsername()) &&
                Boolean.TRUE.equals(userRepository.existsByUsername(userUpdateDTO.getUsername()))) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(MessageResponse.error("Error: Username is already taken!"));
        }

        if (!user.getEmail().equals(userUpdateDTO.getEmail()) &&
                Boolean.TRUE.equals(userRepository.existsByEmail(userUpdateDTO.getEmail()))) {
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

        // Only update password if one is provided
        if (userUpdateDTO.getPassword() != null && !userUpdateDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userUpdateDTO.getPassword()));
        }

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
            throw new RuntimeException(USER_NOT_FOUND);
        }
        userRepository.deleteById(id);
    }

    @PutMapping("/{id}/lock")
    public ResponseEntity<?> lockUser(@PathVariable UUID id) {
        User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException(id));
        user.setStatus("LOCKED");
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // Revoke all active sessions for security
        int revokedSessions = authService.revokeAllUserSessions(id, "ACCOUNT_LOCKED");

        Map<String, Object> response = new HashMap<>();
        response.putAll(convertUserToDTO(user));
        response.put("sessionsRevoked", revokedSessions);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/unlock")
    public ResponseEntity<?> unlockUser(@PathVariable UUID id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException(USER_NOT_FOUND));
        user.setStatus("ACTIVE");
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return ResponseEntity.ok(convertUserToDTO(user));
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<?> resetPassword(@PathVariable UUID id, @RequestParam String newPassword) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException(USER_NOT_FOUND));
        user.setPassword(passwordEncoder.encode(newPassword)); // Properly encode the password
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // Revoke all active sessions for security after password reset
        int revokedSessions = authService.revokeAllUserSessions(id, "PASSWORD_RESET");

        Map<String, Object> response = new HashMap<>();
        response.putAll(convertUserToDTO(user));
        response.put("sessionsRevoked", revokedSessions);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/toggle-super-admin")
    public ResponseEntity<?> toggleSuperAdmin(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(USER_NOT_FOUND));

        // Toggle the superAdmin status
        user.setSuperAdmin(!user.isSuperAdmin());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put(SUPER_ADMIN, user.isSuperAdmin());

        return ResponseEntity.ok(response);
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

    @GetMapping("/{id}/activity-logs")
    public ResponseEntity<?> getUserActivityLogs(@PathVariable UUID id) {
        List<Map<String, Object>> activityLogs = activityLogRepository.findByUserOrderByCreatedAtDesc(
                userRepository.findById(id).orElseThrow(() -> new RuntimeException(USER_NOT_FOUND)))
                .stream()
                .map(log -> {
                    Map<String, Object> logDTO = new HashMap<>();
                    logDTO.put("id", log.getId());
                    logDTO.put("action", log.getAction());
                    logDTO.put("details", log.getDetails());
                    logDTO.put("ipAddress", log.getIpAddress());
                    logDTO.put("userAgent", log.getUserAgent());
                    logDTO.put("createdAt", log.getCreatedAt());
                    return logDTO;
                })
                .toList();

        return ResponseEntity.ok(activityLogs);
    }

    @GetMapping("/auth/sessions/user/{id}")
    public ResponseEntity<?> getUserSessions(@PathVariable UUID id) {
        // Check if the user exists
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(USER_NOT_FOUND));

        // Fetch user sessions from the AuthService
        List<Map<String, Object>> sessions = authService.getUserSessions(id);

        return ResponseEntity.ok(sessions);
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
        userDTO.put(USERNAME, user.getUsername());
        userDTO.put("email", user.getEmail());
        userDTO.put(FULL_NAME, user.getFullName());
        userDTO.put(AVATAR_URL, user.getAvatarUrl());
        userDTO.put("bio", user.getBio());
        userDTO.put(STATUS, user.getStatus());
        userDTO.put(EMAIL_VERIFIED, user.isEmailVerified());
        userDTO.put(LAST_LOGIN, user.getLastLogin());
        userDTO.put(SUPER_ADMIN, user.isSuperAdmin());
        userDTO.put(CREATED_AT, user.getCreatedAt());
        userDTO.put(UPDATED_AT, user.getUpdatedAt());

        // Add roles without circular references (only role names)
        userDTO.put(ROLES, user.getRoles().stream().map(Role::getName).toList());

        // Add role IDs for frontend form selection
        userDTO.put("roleIds", user.getRoles().stream().map(Role::getId).toList());

        return userDTO;
    }
}
