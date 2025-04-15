package io.akitect.cms.model;

import java.util.HashSet;
import java.util.Set;

import io.akitect.cms.model.base.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "tags")
@Getter
@Setter
public class Tag extends BaseEntity {

    @Column(name = "name", length = 50, nullable = false, unique = true)
    private String name;

    @Column(name = "slug", length = 60, nullable = false, unique = true)
    private String slug;

    @Column(name = "description")
    private String description;

    @ManyToMany(mappedBy = "tags")
    private Set<Post> posts = new HashSet<>();
}