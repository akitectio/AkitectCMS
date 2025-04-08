package io.akitect.cms.model;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_series")
@Getter
@Setter
@NoArgsConstructor
public class UserSeries implements Serializable {

    @EmbeddedId
    private UserSeriesId id;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @MapsId("seriesId")
    @JoinColumn(name = "series_id")
    private Series series;

    @Column(name = "enrollment_date", nullable = false)
    private LocalDateTime enrollmentDate = LocalDateTime.now();

    @Column(name = "completed_lessons", nullable = false)
    private int completedLessons = 0;

    @Column(name = "total_lessons", nullable = false)
    private int totalLessons = 0;

    @Column(name = "completion_date")
    private LocalDateTime completionDate;

    // Constructor with user and series
    public UserSeries(User user, Series series) {
        this.user = user;
        this.series = series;
        this.id = new UserSeriesId(user.getId(), series.getId());
    }

    // Embedded ID class for composite primary key
    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class UserSeriesId implements Serializable {

        @Column(name = "user_id")
        private UUID userId;

        @Column(name = "series_id")
        private UUID seriesId;
    }
}