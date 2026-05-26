package com.meetup.taskservice.service;

import com.meetup.taskservice.domain.entity.*;
import com.meetup.taskservice.dto.request.TagCreateDto;
import com.meetup.taskservice.dto.request.TagUpdateDto;
import com.meetup.taskservice.dto.response.TagResponseDto;
import com.meetup.taskservice.exception.EntityAlreadyExistsException;
import com.meetup.taskservice.exception.EntityNotFoundException;
import com.meetup.taskservice.mapper.TagMapper;
import com.meetup.taskservice.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TagService {
    private final TagRepository tagRepository;
    private final TagMapper tagMapper;

    @Transactional
    public List<TagResponseDto> getTags(String contextId) {

        return tagRepository.findByContextId(contextId)
                .stream()
                .map(tagMapper::toResponseDto)
                .toList();
    }

    public TagResponseDto getTagById(String contextId, UUID id) {
        Tag tag = findTag(contextId, id);
        return tagMapper.toResponseDto(tag);
    }

    public TagResponseDto createTag(String contextId, TagCreateDto tagCreateDto) {
        if (tagRepository.existsByNameIgnoreCaseAndContextId(contextId, tagCreateDto.getName())) {
            throw new EntityAlreadyExistsException("A tag with this name already exists: " + tagCreateDto.getName());
        }

        Tag newTag = tagMapper.toEntity(tagCreateDto);
        UserContext user = UserContextHolder.get();
        newTag.setContextId(contextId);
        newTag.setCreatedBy(user.getUserId());
        Tag savedTag = tagRepository.save(newTag);
        return tagMapper.toResponseDto(savedTag);
    }

    public TagResponseDto updateTag(String contextId, UUID id, TagUpdateDto tagUpdateDto) {
        Tag tag = findTag(contextId, id);

        boolean hasChanges = false;

        if (tagUpdateDto.getName() != null && !tagUpdateDto.getName().equals(tag.getName())) {
            tag.setName(tagUpdateDto.getName());
            hasChanges = true;
        }
        if (tagUpdateDto.getDescription() != null && !tagUpdateDto.getDescription().equals(tag.getDescription())) {
            tag.setDescription(tagUpdateDto.getDescription());
            hasChanges = true;
        }
        if (tagUpdateDto.getColor() != null && !tagUpdateDto.getColor().equals(tag.getColor())) {
            tag.setColor(tagUpdateDto.getColor());
            hasChanges = true;
        }
        if (tagUpdateDto.getIcon() != null && !tagUpdateDto.getIcon().equals(tag.getIcon())) {
            tag.setIcon(tagUpdateDto.getIcon());
            hasChanges = true;
        }

        if (!hasChanges) {
            return tagMapper.toResponseDto(tag);
        }

        return tagMapper.toResponseDto(tagRepository.save(tag));
    }

    public void deleteTag(String contextId, UUID id) {
        findTag(contextId, id);
        tagRepository.deleteById(id);
    }

    //Helper functions
    private Tag findTag(String contextId, UUID tagId) {
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new EntityNotFoundException("Tag not found with ID: " + tagId));
        if (!tag.getContextId().equals(contextId)) {
            throw new EntityNotFoundException("Tag not found with ID: " + tagId);
        }
        return tag;
    }
}
