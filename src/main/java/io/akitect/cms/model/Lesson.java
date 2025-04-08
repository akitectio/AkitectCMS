package io.akitect.cms.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "lessons")
@Getter
@Setter
public class Lesson extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "series_id", nullable = false)
    private Series series;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Lesson parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private Set<Lesson> children = new HashSet<>();

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "slug", length = 300, nullable = false)
    private String slug;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "content_type", length = 30, nullable = false)
    private String contentType = "TEXT";

    @Column(name = "video_url", length = 255)
    private String videoUrl;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "display_order", nullable = false)
    private int displayOrder = 0;

    @Column(name = "is_free", nullable = false)
    private boolean free = false;

    @Column(name = "status", length = 20, nullable = false)
    private String status = "DRAFT";

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "meta_title", length = 255)
    private String metaTitle;

    @Column(name = "meta_description", columnDefinition = "TEXT")
    private String metaDescription;

    @Column(name = "views_count", nullable = false)
    private int viewsCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL)
    private Set<UserProgress> userProgresses = new HashSet<>();

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL)
    private Set<Comment> comments = new HashSet<>();
}