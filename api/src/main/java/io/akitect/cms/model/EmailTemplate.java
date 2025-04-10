package io.akitect.cms.model;

import io.akitect.cms.model.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "email_templates")
@Getter
@Setter
public class EmailTemplate extends BaseEntity {

    @Column(name = "template_key", length = 100, nullable = false, unique = true)
    private String templateKey;

    @Column(name = "subject", length = 255, nullable = false)
    private String subject;

    @Column(name = "content", columnDefinition = "text", nullable = false)
    private String content;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "variables", columnDefinition = "text")
    private String variables;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;
}