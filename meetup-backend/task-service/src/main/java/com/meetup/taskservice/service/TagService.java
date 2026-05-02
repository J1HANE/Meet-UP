package com.meetup.taskservice.service;

import com.meetup.taskservice.domain.entity.Category;
import com.meetup.taskservice.domain.entity.Tag;
import com.meetup.taskservice.dto.request.TagCreateDto;
import com.meetup.taskservice.dto.request.TagUpdateDto;
import com.meetup.taskservice.dto.response.TagResponseDto;
import com.meetup.taskservice.exception.EntityAlreadyExistsException;
import com.meetup.taskservice.exception.EntityNotFoundException;
import com.meetup.taskservice.mapper.TagMapper;
import com.meetup.taskservice.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TagService {
    private final TagRepository tagRepository;
    private final TagMapper tagMapper;

    public List<TagResponseDto> getTags() {

        return tagRepository.findAll()
                .stream()
                .map(tagMapper::toResponseDto)
                .toList();
    }

    public TagResponseDto getTagById(UUID id) {
        Tag tag = tagRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Tag not found with ID: " + id));
        return tagMapper.toResponseDto(tag);
    }

    public TagResponseDto createTag(TagCreateDto tagCreateDto) {
        if (tagRepository.existsByName(tagCreateDto.getName())) {
            throw new EntityAlreadyExistsException("A tag with this name already exists: " + tagCreateDto.getName());
        }
        Tag newTag = tagRepository.save(tagMapper.toEntity(tagCreateDto));
        return tagMapper.toResponseDto(newTag);
    }

    public TagResponseDto updateTag(UUID id, TagUpdateDto tagUpdateDto) {
        Tag tag = tagRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Tag not found with ID: " + id));

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

    public void deleteTag(UUID id) {
        if (!tagRepository.existsById(id)) {
            throw new EntityNotFoundException("Tag not found with ID: " + id);
        }
        tagRepository.deleteById(id);
    }
}
