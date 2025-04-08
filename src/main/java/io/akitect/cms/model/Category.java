package io.akitect.cms.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "categories")
@Getter
@Setter
public class Category extends BaseEntity {

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "slug", length = 150, nullable = false, unique = true)
    private String slug;

    @Column(name = "description")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Category parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private Set<Category> children = new HashSet<>();

    @Column(name = "meta_title", length = 255)
    private String metaTitle;

    @Column(name = "meta_description")
    private String metaDescription;

    @Column(name = "is_featured", nullable = false)
    private boolean featured = false;

    @Column(name = "display_order", nullable = false)
    private int displayOrder = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @ManyToMany(mappedBy = "categories")
    private Set<Post> posts = new HashSet<>();

    @ManyToMany(mappedBy = "categories")
    private Set<Series> series = new HashSet<>();
}