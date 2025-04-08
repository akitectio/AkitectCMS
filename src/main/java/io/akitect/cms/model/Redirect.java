package io.akitect.cms.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "redirects")
@Getter
@Setter
public class Redirect extends BaseEntity {

    @Column(name = "source_path", length = 500, nullable = false, unique = true)
    private String sourcePath;

    @Column(name = "target_path", length = 500, nullable = false)
    private String targetPath;

    @Column(name = "redirect_type", nullable = false)
    private int redirectType = 301;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
}