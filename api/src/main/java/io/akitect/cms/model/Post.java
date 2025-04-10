package io.akitect.cms.model;

import io.akitect.cms.model.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "posts")
@Getter
@Setter
public class Post extends BaseEntity {

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Column(name = "slug", length = 300, nullable = false, unique = true)
    private String slug;

    @Column(name = "content", columnDefinition = "text", nullable = false)
    private String content;

    @Column(name = "excerpt", columnDefinition = "text")
    private String excerpt;

    @Column(name = "featured_image_url", length = 255)
    private String featuredImageUrl;

    @Column(name = "status", length = 20, nullable = false)
    private String status = "DRAFT";

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "meta_title", length = 255)
    private String metaTitle;

    @Column(name = "meta_description", columnDefinition = "text")
    private String metaDescription;

    @Column(name = "is_featured", nullable = false)
    private boolean featured = false;

    @Column(name = "allow_comments", nullable = false)
    private boolean allowComments = true;

    @Column(name = "views_count", nullable = false)
    private int viewsCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToMany
    @JoinTable(
            name = "post_categories",
            joinColumns = @JoinColumn(name = "post_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new HashSet<>();

    @ManyToMany
    @JoinTable(
            name = "post_tags",
            joinColumns = @JoinColumn(name = "post_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    private Set<PostRevision> revisions = new HashSet<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL)
    private Set<Comment> comments = new HashSet<>();
}