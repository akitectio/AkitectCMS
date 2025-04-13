package io.akitect.cms.security;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import io.akitect.cms.model.User;
import io.akitect.cms.repository.UserSessionRepository;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtUtils {

    @Value("${akitect.cms.jwt.secret:c8H9Tqx2EdMaYvLp3B7F5e4Z1r6W0s9G8i2kDnJmXoQbUyPwRtA}")
    private String jwtSecret;

    @Value("${akitect.cms.jwt.expiration:86400000}")
    private int jwtExpirationMs;

    @Autowired
    private UserSessionRepository userSessionRepository;

    // Add getter for JWT expiration
    public int getJwtExpirationMs() {
        return jwtExpirationMs;
    }

    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .claim("userId", userPrincipal.getId())
                .claim("superAdmin", userPrincipal.isSuperAdmin())
                .claim("sessionId", UUID.randomUUID().toString()) // Add unique session identifier
                .compact();
    }

    public String generateJwtToken(User user) {
        UUID sessionId = UUID.randomUUID();

        return Jwts.builder()
                .setSubject(user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .claim("userId", user.getId())
                .claim("superAdmin", user.isSuperAdmin())
                .claim("sessionId", sessionId.toString()) // Add unique session identifier
                .compact();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public UUID getUserIdFromJwtToken(String token) {
        String userIdStr = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("userId", String.class);

        return UUID.fromString(userIdStr);
    }

    public boolean isSuperAdminFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("superAdmin", Boolean.class);
    }

    public String getSessionIdFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("sessionId", String.class);
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);

            // Check if token is associated with active session
            updateTokenActivity(authToken);

            return true;
        } catch (SignatureException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        } catch (Exception e) {
            log.error("JWT validation error: {}", e.getMessage());
        }
        return false;
    }

    private void updateTokenActivity(String token) {
        try {
            userSessionRepository.updateLastActivity(token, LocalDateTime.now());
        } catch (Exception e) {
            log.warn("Failed to update token activity: {}", e.getMessage());
        }
    }
}