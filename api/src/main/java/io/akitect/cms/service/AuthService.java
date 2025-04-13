package io.akitect.cms.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import io.akitect.cms.dto.JwtResponse;
import io.akitect.cms.dto.LoginDTO;
import io.akitect.cms.dto.MessageResponse;
import io.akitect.cms.dto.RegisterDTO;
import io.akitect.cms.model.ActivityLog;
import io.akitect.cms.model.Role;
import io.akitect.cms.model.User;
import io.akitect.cms.model.UserSession;
import io.akitect.cms.repository.ActivityLogRepository;
import io.akitect.cms.repository.RoleRepository;
import io.akitect.cms.repository.UserRepository;
import io.akitect.cms.repository.UserSessionRepository;
import io.akitect.cms.security.JwtUtils;
import io.akitect.cms.security.UserDetailsImpl;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final UserSessionRepository userSessionRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String USER_AGENT = "User-Agent";
    private static final String UNKNOWN = "unknown";

    public AuthService(AuthenticationManager authenticationManager, JwtUtils jwtUtils,
            UserRepository userRepository, ActivityLogRepository activityLogRepository,
            UserSessionRepository userSessionRepository, RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
        this.activityLogRepository = activityLogRepository;
        this.userSessionRepository = userSessionRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public JwtResponse login(LoginDTO loginDTO, HttpServletRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginDTO.getUsername(), loginDTO.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

            // Get user and check if active
            User user = userRepository.findById(userDetails.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user is active
            if (!user.isActive()) {
                log.warn("Login attempt for inactive account: {}", loginDTO.getUsername());
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is not active");
            }

            // Generate JWT token
            String jwt = jwtUtils.generateJwtToken(authentication);

            // Update last login
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            // Create new session record
            UserSession session = new UserSession();
            session.setUser(user);
            session.setToken(jwt);
            session.setIpAddress(getClientIp(request));
            session.setUserAgent(request.getHeader(USER_AGENT));
            session.setDeviceInfo(extractDeviceInfo(request.getHeader(USER_AGENT)));
            session.setActive(true);
            session.setLastActivity(LocalDateTime.now());

            // Set expiry based on token expiration
            LocalDateTime expiryTime = LocalDateTime.now().plusSeconds(jwtUtils.getJwtExpirationMs() / 1000);
            session.setExpiresAt(expiryTime);
            userSessionRepository.save(session);

            // Log activity
            ActivityLog activityLog = new ActivityLog();
            activityLog.setUser(user);
            activityLog.setAction("LOGIN");
            activityLog.setIpAddress(getClientIp(request));
            activityLog.setUserAgent(request.getHeader(USER_AGENT));
            activityLog.setCreatedAt(LocalDateTime.now());
            activityLogRepository.save(activityLog);

            // Get user roles
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .toList();

            // Return JwtResponse with user details
            return new JwtResponse(
                    jwt,
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getEmail(),
                    user.getFullName(),
                    user.getAvatarUrl(),
                    user.isSuperAdmin(),
                    roles);
        } catch (BadCredentialsException e) {
            log.error("Invalid username or password", e);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        } catch (ResponseStatusException e) {
            log.error("Login failed: {}", e.getReason(), e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during login", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred", e);
        }
    }

    // Helper method to extract device information from user-agent
    private String extractDeviceInfo(String userAgent) {
        if (userAgent == null) {
            return "Unknown Device";
        }

        // Simple detection logic - could be improved with a proper user-agent parsing
        // library
        String deviceInfo = "Unknown Device";

        if (userAgent.contains("Windows")) {
            deviceInfo = "Windows";
        } else if (userAgent.contains("Mac OS X")) {
            deviceInfo = "Mac";
        } else if (userAgent.contains("iPhone")) {
            deviceInfo = "iPhone";
        } else if (userAgent.contains("iPad")) {
            deviceInfo = "iPad";
        } else if (userAgent.contains("Android")) {
            deviceInfo = "Android";
        } else if (userAgent.contains("Linux")) {
            deviceInfo = "Linux";
        }

        // Add browser info
        if (userAgent.contains("Chrome") && !userAgent.contains("Chromium")) {
            deviceInfo += " - Chrome";
        } else if (userAgent.contains("Firefox")) {
            deviceInfo += " - Firefox";
        } else if (userAgent.contains("Safari") && !userAgent.contains("Chrome")) {
            deviceInfo += " - Safari";
        } else if (userAgent.contains("Edge")) {
            deviceInfo += " - Edge";
        } else if (userAgent.contains("MSIE") || userAgent.contains("Trident")) {
            deviceInfo += " - Internet Explorer";
        }

        return deviceInfo;
    }

    public boolean logout(String token, HttpServletRequest request) {
        try {
            if (token != null) {
                // Find and invalidate the session
                Optional<UserSession> sessionOpt = userSessionRepository.findByToken(token);
                if (sessionOpt.isPresent()) {
                    UserSession session = sessionOpt.get();
                    session.setActive(false);
                    session.setRevokedAt(LocalDateTime.now());
                    userSessionRepository.save(session);

                    // Log activity
                    ActivityLog activityLog = new ActivityLog();
                    activityLog.setUser(session.getUser());
                    activityLog.setAction("LOGOUT");
                    activityLog.setIpAddress(getClientIp(request));
                    activityLog.setUserAgent(request.getHeader(USER_AGENT));
                    activityLog.setCreatedAt(LocalDateTime.now());
                    activityLogRepository.save(activityLog);

                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            log.error("Error during logout", e);
            return false;
        }
    }

    public MessageResponse register(RegisterDTO registerDTO, HttpServletRequest request) {
        // Check if username already exists
        if (Boolean.TRUE.equals(userRepository.existsByUsername(registerDTO.getUsername()))) {
            return MessageResponse.error("Error: Username is already taken!");
        }

        // Check if email already exists
        if (Boolean.TRUE.equals(userRepository.existsByEmail(registerDTO.getEmail()))) {
            return MessageResponse.error("Error: Email is already in use!");
        }

        // Create new user's account
        User user = new User();
        user.setUsername(registerDTO.getUsername());
        user.setEmail(registerDTO.getEmail());
        user.setPassword(passwordEncoder.encode(registerDTO.getPassword()));
        user.setFullName(registerDTO.getFullName());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setStatus("ACTIVE");
        user.setSuperAdmin(registerDTO.isSuperAdmin());

        Set<Role> roles = new HashSet<>();

        // If no roles specified, assign default ROLE_USER
        if (registerDTO.getRoles() == null || registerDTO.getRoles().isEmpty()) {
            Role userRole = roleRepository.findByName("USER")
                    .orElseThrow(() -> new RuntimeException("Error: Role USER is not found."));
            roles.add(userRole);
        } else {
            registerDTO.getRoles().forEach(roleName -> {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Error: Role " + roleName + " is not found."));
                roles.add(role);
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        // Log activity
        ActivityLog activityLog = new ActivityLog();
        activityLog.setUser(user);
        activityLog.setAction("REGISTER");
        activityLog.setIpAddress(getClientIp(request));
        activityLog.setUserAgent(request.getHeader(USER_AGENT));
        activityLog.setCreatedAt(LocalDateTime.now());
        activityLogRepository.save(activityLog);

        return MessageResponse.success("User registered successfully!");
    }

    public boolean validateToken(String token) {
        return jwtUtils.validateJwtToken(token);
    }

    private String getClientIp(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || UNKNOWN.equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || UNKNOWN.equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || UNKNOWN.equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        return ipAddress;
    }

    /**
     * Revoke all active sessions for a user
     * 
     * @param userId The user ID whose sessions to revoke
     * @param reason The reason for revocation (e.g., "LOCKED", "PASSWORD_CHANGED")
     * @return The number of sessions revoked
     */
    @Transactional
    public int revokeAllUserSessions(UUID userId, String reason) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<UserSession> activeSessions = userSessionRepository.findActiveSessionsByUserId(userId);
            int count = 0;

            for (UserSession session : activeSessions) {
                session.setActive(false);
                session.setRevokedAt(LocalDateTime.now());
                userSessionRepository.save(session);
                count++;

                // Log the session revocation
                ActivityLog activityLog = new ActivityLog();
                activityLog.setUser(user);
                activityLog.setAction("SESSION_REVOKED");
                activityLog.setDetails("Session revoked: " + reason);
                activityLog.setCreatedAt(LocalDateTime.now());
                activityLogRepository.save(activityLog);
            }

            return count;
        } catch (Exception e) {
            log.error("Error revoking user sessions", e);
            return 0;
        }
    }

    /**
     * Fetch all active sessions for a user
     * 
     * @param userId The user ID
     * @return A list of session details
     */
    public List<Map<String, Object>> getUserSessions(UUID userId) {
        // Fetch active sessions for the user
        List<UserSession> sessions = userSessionRepository.findActiveSessionsByUserId(userId);

        // Map session details to a list of maps
        return sessions.stream().map(session -> {
            Map<String, Object> sessionDetails = new HashMap<>();
            sessionDetails.put("id", session.getId());
            sessionDetails.put("ipAddress", session.getIpAddress());
            sessionDetails.put(USER_AGENT, session.getUserAgent());
            sessionDetails.put("deviceInfo", session.getDeviceInfo());
            sessionDetails.put("lastActivity", session.getLastActivity());
            sessionDetails.put("expiresAt", session.getExpiresAt());
            sessionDetails.put("active", session.isActive());
            return sessionDetails;
        }).toList();
    }
}