package io.akitect.cms.service;

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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

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
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDTO.getUsername(), loginDTO.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        // Update last login
        User user = userRepository.findById(userDetails.getId()).orElseThrow(() ->
                new RuntimeException("User not found"));
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

        return new JwtResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                userDetails.getFullName(),
                userDetails.getAvatarUrl(),
                userDetails.isSuperAdmin(),
                roles
        );
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