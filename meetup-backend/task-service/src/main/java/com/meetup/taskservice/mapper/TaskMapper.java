package com.meetup.taskservice.mapper;

import com.meetup.taskservice.domain.entity.Task;
import com.meetup.taskservice.dto.TaskSummaryDto;
import com.meetup.taskservice.dto.request.TaskCreateDto;
import com.meetup.taskservice.dto.request.TaskUpdateDto;
import com.meetup.taskservice.dto.response.TaskResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = {CategoryMapper.class, TagMapper.class})
public interface TaskMapper {



    @Mapping(target = "parentTaskId",   source = "parentTask.taskId")
    @Mapping(target = "subTaskCount",   expression = "java(task.getSubTasks().size())")
    @Mapping(target = "category",       source = "category")         // delegated to CategoryMapper
    @Mapping(target = "tags",           source = "tags")// delegated to TagMapper
    @Mapping(target = "isRecurring",    source = "recurring")
    @Mapping(target = "isMilestone",    source = "milestone")
    @Mapping(target = "dependencyIds",  expression = "java(task.getDependencies().stream().map(d -> d.getDependsOnTask().getTaskId()).collect(java.util.stream.Collectors.toSet()))")
    TaskResponseDto toResponseDto(Task task);



    @Mapping(target = "parentTaskId", source = "parentTask.taskId")
    TaskSummaryDto toSummaryDto(Task task);



    @Mapping(target = "taskId",          ignore = true)
    @Mapping(target = "parentTask",      ignore = true)
    @Mapping(target = "subTasks",        ignore = true)
    @Mapping(target = "category",        ignore = true)
    @Mapping(target = "tags",            ignore = true)
    @Mapping(target = "dependencies",    ignore = true)
    @Mapping(target = "dependents",      ignore = true)
    @Mapping(target = "blockHistory",    ignore = true)
    @Mapping(target = "status",          constant = "IN_BACKLOG")
    @Mapping(target = "progressPercent", constant = "0")
    @Mapping(target = "lastActivityAt",  expression = "java(java.time.OffsetDateTime.now())")
    @Mapping(target = "createdAt",       expression = "java(java.time.OffsetDateTime.now())")
    @Mapping(target = "deletedAt",       ignore = true)
    @Mapping(target = "assignedAt",      ignore = true)
    @Mapping(target = "startedAt",       ignore = true)
    @Mapping(target = "blockedAt",       ignore = true)
    @Mapping(target = "unblockedAt",     ignore = true)
    @Mapping(target = "submittedAt",     ignore = true)
    @Mapping(target = "completedAt",     ignore = true)
    @Mapping(target = "cancelledAt",     ignore = true)
    @Mapping(target = "actualHours",     ignore = true)
    @Mapping(target = "createdBy",     ignore = true)
    Task toEntity(TaskCreateDto dto);



    @Mapping(target = "taskId",          ignore = true)
    @Mapping(target = "parentTask",      ignore = true)
    @Mapping(target = "subTasks",        ignore = true)
    @Mapping(target = "category",        ignore = true)
    @Mapping(target = "tags",            ignore = true)
    @Mapping(target = "dependencies",    ignore = true)
    @Mapping(target = "dependents",      ignore = true)
    @Mapping(target = "blockHistory",    ignore = true)
    @Mapping(target = "status",          ignore = true)
    @Mapping(target = "progressPercent", ignore = true)
    @Mapping(target = "createdBy",       ignore = true)
    @Mapping(target = "lastActivityAt",  ignore = true)
    @Mapping(target = "createdAt",       ignore = true)
    @Mapping(target = "deletedAt",       ignore = true)
    @Mapping(target = "assignedAt",      ignore = true)
    @Mapping(target = "startedAt",       ignore = true)
    @Mapping(target = "blockedAt",       ignore = true)
    @Mapping(target = "unblockedAt",     ignore = true)
    @Mapping(target = "submittedAt",     ignore = true)
    @Mapping(target = "completedAt",     ignore = true)
    @Mapping(target = "cancelledAt",     ignore = true)
    void updateEntityFromDto(TaskUpdateDto dto, @MappingTarget Task task);



    List<TaskResponseDto> toResponseDtoList(List<Task> tasks);
    List<TaskSummaryDto> toSummaryDtoList(List<Task> tasks);
}
