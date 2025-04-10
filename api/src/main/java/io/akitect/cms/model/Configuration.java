package io.akitect.cms.model;

import io.akitect.cms.model.base.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "configurations")
@Getter
@Setter
public class Configuration extends BaseEntity {

    @Column(name = "config_key", length = 100, nullable = false, unique = true)
    private String configKey;

    @Column(name = "config_value", columnDefinition = "text")
    private String configValue;

    @Column(name = "config_group", length = 50, nullable = false)
    private String configGroup;

    @Column(name = "data_type", length = 20, nullable = false)
    private String dataType = "STRING";

    @Column(name = "is_system", nullable = false)
    private boolean system = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by")
    private User updatedBy;
}