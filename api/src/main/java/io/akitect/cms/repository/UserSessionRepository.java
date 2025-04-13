package io.akitect.cms.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import io.akitect.cms.model.User;
import io.akitect.cms.model.UserSession;

@Repository
public interface UserSessionRepository extends JpaRepository<UserSession, UUID> {

    Optional<UserSession> findByToken(String token);

    List<UserSession> findByUserOrderByLastActivityDesc(User user);

    @Query("SELECT s FROM UserSession s WHERE s.user.id = :userId AND s.active = true AND s.revokedAt IS NULL ORDER BY s.lastActivity DESC")
    List<UserSession> findActiveSessionsByUserId(UUID userId);

    @Modifying
    @Query("UPDATE UserSession s SET s.active = false, s.revokedAt = :now WHERE s.id = :sessionId")
    void revokeSession(UUID sessionId, LocalDateTime now);

    @Modifying
    @Query("UPDATE UserSession s SET s.active = false, s.revokedAt = :now WHERE s.user.id = :userId AND s.id != :currentSessionId")
    void revokeAllOtherSessions(UUID userId, UUID currentSessionId, LocalDateTime now);

    @Modifying
    @Query("UPDATE UserSession s SET s.lastActivity = :now WHERE s.token = :token")
    void updateLastActivity(String token, LocalDateTime now);
}