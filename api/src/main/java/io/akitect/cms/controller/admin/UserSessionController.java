//package io.akitect.cms.controller.admin;
//
//import java.time.LocalDateTime;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//import java.util.UUID;
//import java.util.stream.Collectors;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.security.core.annotation.AuthenticationPrincipal;
//import org.springframework.transaction.annotation.Transactional;
//import org.springframework.web.bind.annotation.DeleteMapping;
//import org.springframework.web.bind.annotation.GetMapping;
//import org.springframework.web.bind.annotation.PathVariable;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//import io.akitect.cms.dto.MessageResponse;
//import io.akitect.cms.model.User;
//import io.akitect.cms.model.UserSession;
//import io.akitect.cms.repository.UserRepository;
//import io.akitect.cms.repository.UserSessionRepository;
//import io.akitect.cms.security.JwtUtils;
//import io.akitect.cms.security.UserDetailsImpl;
//import io.akitect.cms.util.Constants;
//import jakarta.servlet.http.HttpServletRequest;
//
//@RestController
//@RequestMapping(Constants.ADMIN_BASE_PATH + "/sessions")
//public class UserSessionController extends AdminBaseController {
//
//    @Autowired
//    private UserSessionRepository userSessionRepository;
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Autowired
//    private JwtUtils jwtUtils;
//
//    /**
//     * Get current user's active sessions
//     */
//    @GetMapping("/my")
//    public ResponseEntity<?> getMyActiveSessions(@AuthenticationPrincipal UserDetailsImpl userDetails) {
//        User user = userRepository.findById(userDetails.getId())
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        List<Map<String, Object>> sessions = userSessionRepository.findActiveSessionsByUserId(user.getId())
//                .stream()
//                .map(this::convertSessionToDTO)
//                .collect(Collectors.toList());
//
//        return ResponseEntity.ok(sessions);
//    }
//
//    /**
//     * Get current user's session history
//     */
//    @GetMapping("/my/history")
//    public ResponseEntity<?> getMySessionHistory(@AuthenticationPrincipal UserDetailsImpl userDetails) {
//        User user = userRepository.findById(userDetails.getId())
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        List<Map<String, Object>> sessions = userSessionRepository.findByUserOrderByLastActivityDesc(user)
//                .stream()
//                .map(this::convertSessionToDTO)
//                .collect(Collectors.toList());
//
//        return ResponseEntity.ok(sessions);
//    }
//
//    /**
//     * Revoke a specific session (log out from a device)
//     */
//    @DeleteMapping("/{sessionId}")
//    @Transactional
//    public ResponseEntity<?> revokeSession(
//            @PathVariable UUID sessionId,
//            @AuthenticationPrincipal UserDetailsImpl userDetails,
//            HttpServletRequest request) {
//
//        // Get the current session's token
//        String currentToken = parseJwt(request);
//        UUID currentUserId = userDetails.getId();
//
//        // Find the session to revoke
//        UserSession sessionToRevoke = userSessionRepository.findById(sessionId)
//                .orElseThrow(() -> new RuntimeException("Session not found"));
//
//        // Security check - users can only revoke their own sessions
//        if (!sessionToRevoke.getUser().getId().equals(currentUserId)) {
//            return ResponseEntity.status(403).body(
//                    new MessageResponse("You are not authorized to revoke this session"));
//        }
//
//        // Don't allow revoking the current session
//        if (currentToken != null && currentToken.equals(sessionToRevoke.getToken())) {
//            return ResponseEntity.badRequest().body(
//                    new MessageResponse("Cannot revoke your current session. Use logout instead."));
//        }
//
//        // Revoke the session
//        sessionToRevoke.setActive(false);
//        sessionToRevoke.setRevokedAt(LocalDateTime.now());
//        userSessionRepository.save(sessionToRevoke);
//
//        return ResponseEntity.ok(new MessageResponse("Session revoked successfully"));
//    }
//
//    /**
//     * Revoke all other sessions except the current one (logout from all other
//     * devices)
//     */
//    @PostMapping("/revoke-others")
//    @Transactional
//    public ResponseEntity<?> revokeAllOtherSessions(
//            @AuthenticationPrincipal UserDetailsImpl userDetails,
//            HttpServletRequest request) {
//
//        // Get the current session
//        String currentToken = parseJwt(request);
//        if (currentToken == null) {
//            return ResponseEntity.badRequest().body(new MessageResponse("No active session found"));
//        }
//
//        UUID userId = userDetails.getId();
//
//        // Find current session ID
//        UserSession currentSession = userSessionRepository.findByToken(currentToken)
//                .orElseThrow(() -> new RuntimeException("Current session not found"));
//
//        // Revoke all other sessions
//        userSessionRepository.revokeAllOtherSessions(userId, currentSession.getId(), LocalDateTime.now());
//
//        return ResponseEntity.ok(new MessageResponse("All other sessions revoked successfully"));
//    }
//
//    /**
//     * Admin endpoint to get all sessions for a specific user
//     */
//    @GetMapping("/user/{userId}")
//    public ResponseEntity<?> getUserSessions(@PathVariable UUID userId,
//            @AuthenticationPrincipal UserDetailsImpl userDetails) {
//        // Only admins or the user themselves can see their sessions
//        if (!userDetails.getId().equals(userId) && !userDetails.isSuperAdmin()) {
//            return ResponseEntity.status(403).body(
//                    new MessageResponse("You are not authorized to view these sessions"));
//        }
//
//        User user = userRepository.findById(userId)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        List<Map<String, Object>> sessions = userSessionRepository.findByUserOrderByLastActivityDesc(user)
//                .stream()
//                .map(this::convertSessionToDTO)
//                .collect(Collectors.toList());
//
//        return ResponseEntity.ok(sessions);
//    }
//
//    /**
//     * Admin endpoint to revoke a user's session
//     */
//    @DeleteMapping("/user/{userId}/session/{sessionId}")
//    @Transactional
//    public ResponseEntity<?> revokeUserSession(
//            @PathVariable UUID userId,
//            @PathVariable UUID sessionId,
//            @AuthenticationPrincipal UserDetailsImpl userDetails) {
//
//        // Only admins can revoke other users' sessions
//        if (!userDetails.isSuperAdmin()) {
//            return ResponseEntity.status(403).body(
//                    new MessageResponse("You are not authorized to revoke this session"));
//        }
//
//        // Find the session to revoke
//        UserSession sessionToRevoke = userSessionRepository.findById(sessionId)
//                .orElseThrow(() -> new RuntimeException("Session not found"));
//
//        // Make sure the session belongs to the specified user
//        if (!sessionToRevoke.getUser().getId().equals(userId)) {
//            return ResponseEntity.badRequest().body(
//                    new MessageResponse("Session does not belong to the specified user"));
//        }
//
//        // Revoke the session
//        sessionToRevoke.setActive(false);
//        sessionToRevoke.setRevokedAt(LocalDateTime.now());
//        userSessionRepository.save(sessionToRevoke);
//
//        return ResponseEntity.ok(new MessageResponse("Session revoked successfully"));
//    }
//
//    /**
//     * Helper method to convert a UserSession entity to a DTO
//     */
//    private Map<String, Object> convertSessionToDTO(UserSession session) {
//        Map<String, Object> sessionDTO = new HashMap<>();
//        sessionDTO.put("id", session.getId());
//        sessionDTO.put("deviceInfo", session.getDeviceInfo());
//        sessionDTO.put("ipAddress", session.getIpAddress());
//        sessionDTO.put("lastActivity", session.getLastActivity());
//        sessionDTO.put("createdAt", session.getCreatedAt());
//        sessionDTO.put("active", session.isActive());
//        sessionDTO.put("isExpired", session.isExpired());
//        sessionDTO.put("expiresAt", session.getExpiresAt());
//        sessionDTO.put("revokedAt", session.getRevokedAt());
//        sessionDTO.put("isCurrent", false); // This will be set by the frontend
//
//        return sessionDTO;
//    }
//
//    // Helper method to extract JWT from request
//    private String parseJwt(HttpServletRequest request) {
//        String headerAuth = request.getHeader("Authorization");
//
//        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
//            return headerAuth.substring(7);
//        }
//
//        return null;
//    }
//}