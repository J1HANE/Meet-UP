package com.meetup.taskservice.mapper;

import com.meetup.taskservice.domain.entity.TaskBlock;
import com.meetup.taskservice.dto.request.TaskBlockCreateDto;
import com.meetup.taskservice.dto.request.TaskBlockResolveDto;
import com.meetup.taskservice.dto.response.TaskBlockResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TaskBlockMapper {

    // ─── Entity → Response DTO ────────────────────────────────────────────────

    @Mapping(target = "taskId",   source = "task.taskId")
    @Mapping(target = "isActive", expression = "java(block.getUnblockedAt() == null)")
    TaskBlockResponseDto toResponseDto(TaskBlock block);

    // ─── Create DTO → Entity ──────────────────────────────────────────────────

    @Mapping(target = "blockId",     ignore = true)
    @Mapping(target = "task",        ignore = true)   // resolved in service
    @Mapping(target = "blockedAt",   expression = "java(java.time.OffsetDateTime.now())")
    @Mapping(target = "unblockedAt", ignore = true)
    @Mapping(target = "blockedByTask", ignore = true)
    @Mapping(target = "dependencyType", ignore = true)
    TaskBlock toEntity(TaskBlockCreateDto dto);

    // ─── Resolve (unblock) ────────────────────────────────────────────────────

//    @Mapping(target = "blockId",    ignore = true)
//    @Mapping(target = "task",       ignore = true)
//    @Mapping(target = "reason",     ignore = true)
//    @Mapping(target = "blockedAt",  ignore = true)
//    @Mapping(target = "unblockedAt", expression = "java(java.time.OffsetDateTime.now())")
//    void resolveBlock(TaskBlockResolveDto dto, @MappingTarget TaskBlock block);

    // ─── List mapping ─────────────────────────────────────────────────────────

    List<TaskBlockResponseDto> toResponseDtoList(List<TaskBlock> blocks);
}
