package com.meetup.taskservice.mapper;

import com.meetup.taskservice.domain.entity.TaskDependency;
import com.meetup.taskservice.dto.request.TaskDependencyCreateDto;
import com.meetup.taskservice.dto.request.TaskDependencyUpdateDto;
import com.meetup.taskservice.dto.response.TaskDependencyResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TaskDependencyMapper {

    // ─── Entity → Response DTO ────────────────────────────────────────────────

    @Mapping(target = "taskId",        source = "task.taskId")
    @Mapping(target = "dependsOnTaskId", source = "dependsOnTask.taskId")
    @Mapping(target = "dependsOnTaskName", source = "dependsOnTask.taskName")
    TaskDependencyResponseDto toResponseDto(TaskDependency dependency);

    // ─── Create DTO → Entity ──────────────────────────────────────────────────

    @Mapping(target = "id",           ignore = true)   // built in service
    @Mapping(target = "task",         ignore = true)   // resolved in service
    @Mapping(target = "dependsOnTask", ignore = true)  // resolved in service
    TaskDependency toEntity(TaskDependencyCreateDto dto);

    // ─── Update DTO → existing Entity ────────────────────────────────────────

    @Mapping(target = "id",            ignore = true)
    @Mapping(target = "task",          ignore = true)
    @Mapping(target = "dependsOnTask", ignore = true)
    void updateEntityFromDto(TaskDependencyUpdateDto dto, @MappingTarget TaskDependency dependency);

    // ─── List mapping ─────────────────────────────────────────────────────────

    List<TaskDependencyResponseDto> toResponseDtoList(List<TaskDependency> dependencies);
}
