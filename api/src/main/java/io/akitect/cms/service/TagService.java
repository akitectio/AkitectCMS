package io.akitect.cms.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.akitect.cms.dto.TagCreateDTO;
import io.akitect.cms.dto.TagUpdateDTO;
import io.akitect.cms.exception.custom.BadRequestException;
import io.akitect.cms.exception.custom.ResourceNotFoundException;
import io.akitect.cms.model.Tag;
import io.akitect.cms.repository.TagRepository;
import io.akitect.cms.util.SlugUtil;

@Service
public class TagService {

    private final TagRepository tagRepository;

    @Autowired
    public TagService(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    public Page<Tag> getAllTags(Pageable pageable) {
        return tagRepository.findAll(pageable);
    }

    public Tag getTagById(String id) {
        return tagRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found with id: " + id));
    }

    public Tag getTagBySlug(String slug) {
        return tagRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Tag not found with slug: " + slug));
    }

    @Transactional
    public Tag createTag(TagCreateDTO tagCreateDTO) {
        // Check if slug is provided or generate it from name
        String slug = tagCreateDTO.getSlug();
        if (slug == null || slug.isEmpty()) {
            slug = SlugUtil.generateSlug(tagCreateDTO.getName());
        }

        // Validate name uniqueness
        if (tagRepository.existsByName(tagCreateDTO.getName())) {
            throw new BadRequestException("Tag with name '" + tagCreateDTO.getName() + "' already exists");
        }

        // Validate slug uniqueness
        if (tagRepository.existsBySlug(slug)) {
            throw new BadRequestException("Tag with slug '" + slug + "' already exists");
        }

        // Create new tag entity
        Tag tag = new Tag();
        tag.setName(tagCreateDTO.getName());
        tag.setSlug(slug);
        tag.setDescription(tagCreateDTO.getDescription());

        return tagRepository.save(tag);
    }

    @Transactional
    public Tag updateTag(String id, TagUpdateDTO tagUpdateDTO) {
        Tag tag = getTagById(id);

        // Handle name update if provided
        if (tagUpdateDTO.getName() != null && !tagUpdateDTO.getName().isEmpty()) {
            // Check name uniqueness if it's changed
            if (!tag.getName().equals(tagUpdateDTO.getName()) &&
                    tagRepository.existsByName(tagUpdateDTO.getName())) {
                throw new BadRequestException("Tag with name '" + tagUpdateDTO.getName() + "' already exists");
            }
            tag.setName(tagUpdateDTO.getName());
        }

        // Handle slug update if provided
        if (tagUpdateDTO.getSlug() != null && !tagUpdateDTO.getSlug().isEmpty()) {
            // Check slug uniqueness if it's changed
            if (!tag.getSlug().equals(tagUpdateDTO.getSlug()) &&
                    tagRepository.existsBySlug(tagUpdateDTO.getSlug())) {
                throw new BadRequestException("Tag with slug '" + tagUpdateDTO.getSlug() + "' already exists");
            }
            tag.setSlug(tagUpdateDTO.getSlug());
        }

        // Update description if provided
        if (tagUpdateDTO.getDescription() != null) {
            tag.setDescription(tagUpdateDTO.getDescription());
        }

        return tagRepository.save(tag);
    }

    @Transactional
    public Tag createTagIfNotExists(String name) {
        // Check if tag exists by name
        Optional<Tag> existingTag = tagRepository.findByName(name);

        if (existingTag.isPresent()) {
            return existingTag.get();
        } else {
            // Create a new tag if it doesn't exist
            TagCreateDTO createDTO = new TagCreateDTO();
            createDTO.setName(name);
            createDTO.setSlug(SlugUtil.generateSlug(name));
            return createTag(createDTO);
        }
    }

    @Transactional
    public void deleteTag(String id) {
        Tag tag = getTagById(id);
        if (!tag.getPosts().isEmpty()) {
            throw new BadRequestException("Cannot delete tag that is associated with posts");
        }
        tagRepository.delete(tag);
    }

    public List<Tag> searchTags(String query) {
        return tagRepository.searchTags(query);
    }

    public Page<Tag> searchTags(String query, Pageable pageable) {
        return tagRepository.searchTags(query, pageable);
    }
}