package com.meetup.taskservice.mapper;

import com.meetup.taskservice.domain.entity.Tag;
import com.meetup.taskservice.dto.TagDto;
import com.meetup.taskservice.dto.request.TagCreateDto;
import com.meetup.taskservice.dto.request.TagUpdateDto;
import com.meetup.taskservice.dto.response.TagResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring")
public interface TagMapper {

    // ─── Entity → Response DTO ────────────────────────────────────────────────

    @Mapping(target = "taskCount", expression = "java(tag.getTasks().size())")
    TagResponseDto toResponseDto(Tag tag);

    // ─── Entity → lightweight DTO (used inside TaskResponseDto) ──────────────

    TagDto toDto(Tag tag);

    // ─── Create DTO → Entity ──────────────────────────────────────────────────

    @Mapping(target = "tagId",    ignore = true)
    @Mapping(target = "tasks",    ignore = true)
    @Mapping(target = "createdBy",    ignore = true)
    @Mapping(target = "createdAt", expression = "java(java.time.OffsetDateTime.now())")
    Tag toEntity(TagCreateDto dto);

    // ─── Update DTO → existing Entity ────────────────────────────────────────

    @Mapping(target = "tagId",     ignore = true)
    @Mapping(target = "tasks",     ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)  // ownership never changes
    void updateEntityFromDto(TagUpdateDto dto, @MappingTarget Tag tag);

    // ─── List mappings ────────────────────────────────────────────────────────

    List<TagResponseDto> toResponseDtoList(List<Tag> tags);
    Set<TagDto>          toDtoSet(Set<Tag> tags);          // used by TaskMapper
}
