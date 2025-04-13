package io.akitect.cms.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.akitect.cms.model.ActivityLog;
import io.akitect.cms.model.User;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID> {
    List<ActivityLog> findByUserOrderByCreatedAtDesc(User user);
}