package io.akitect.cms.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.akitect.cms.model.Tag;

@Repository
public interface TagRepository extends JpaRepository<Tag, UUID> {
    Optional<Tag> findByName(String name);

    Optional<Tag> findBySlug(String slug);

    Boolean existsByName(String name);

    Boolean existsBySlug(String slug);
}