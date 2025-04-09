package io.akitect.cms.model;

import io.akitect.cms.model.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress")
@Getter
@Setter
public class UserProgress extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(name = "status", length = 20, nullable = false)
    private String status = "NOT_STARTED";

    @Column(name = "progress_percent", nullable = false)
    private int progressPercent = 0;

    @Column(name = "last_position")
    private Integer lastPosition = 0;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}