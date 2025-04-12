package io.akitect.cms.service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import io.akitect.cms.dto.JwtResponse;
import io.akitect.cms.dto.LoginDTO;
import io.akitect.cms.dto.MessageResponse;
import io.akitect.cms.dto.RegisterDTO;
import io.akitect.cms.model.ActivityLog;
import io.akitect.cms.model.Role;
import io.akitect.cms.model.User;
import io.akitect.cms.repository.ActivityLogRepository;
import io.akitect.cms.repository.RoleRepository;
import io.akitect.cms.repository.UserRepository;
import io.akitect.cms.security.JwtUtils;
import io.akitect.cms.security.UserDetailsImpl;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

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

            // Log activity
            ActivityLog activityLog = new ActivityLog();
            activityLog.setUser(user);
            activityLog.setAction("LOGIN");
            activityLog.setIpAddress(getClientIp(request));
            activityLog.setUserAgent(request.getHeader("User-Agent"));
            activityLog.setCreatedAt(LocalDateTime.now());
            activityLogRepository.save(activityLog);

            // Get user roles
            List<String> roles = userDetails.getAuthorities().stream()
                    .map(item -> item.getAuthority())
                    .collect(Collectors.toList());

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

    public MessageResponse register(RegisterDTO registerDTO, HttpServletRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(registerDTO.getUsername())) {
            return MessageResponse.error("Error: Username is already taken!");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(registerDTO.getEmail())) {
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
        activityLog.setUserAgent(request.getHeader("User-Agent"));
        activityLog.setCreatedAt(LocalDateTime.now());
        activityLogRepository.save(activityLog);

        return MessageResponse.success("User registered successfully!");
    }

    public boolean validateToken(String token) {
        return jwtUtils.validateJwtToken(token);
    }

    private String getClientIp(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        return ipAddress;
    }
}