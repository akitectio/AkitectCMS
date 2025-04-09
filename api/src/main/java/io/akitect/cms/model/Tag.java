package io.akitect.cms.model;

import io.akitect.cms.model.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "tags")
@Getter
@Setter
public class Tag extends BaseEntity {

    @Column(name = "name", length = 50, nullable = false)
    private String name;

    @Column(name = "slug", length = 80, nullable = false, unique = true)
    private String slug;

    @Column(name = "description")
    private String description;

    @ManyToMany(mappedBy = "tags")
    private Set<Post> posts = new HashSet<>();
}