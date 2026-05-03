package com.meetup.taskservice.mapper;

import com.meetup.taskservice.domain.entity.Task;
import com.meetup.taskservice.domain.entity.TaskDependency;
import com.meetup.taskservice.domain.enums.TaskStatus;
import com.meetup.taskservice.dto.gantt.GanttDependencyDto;
import com.meetup.taskservice.dto.gantt.GanttTaskDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Mapper(componentModel = "spring")
public interface GanttMapper {

    // ── GanttTaskDto ──────────────────────────────────────────────────────────
    @Mapping(target = "depth",            expression = "java(depth)")
    @Mapping(target = "isCriticalPath",   expression = "java(isCriticalPath)")
    @Mapping(target = "categoryName",     source = "task.category.name")
    @Mapping(target = "categoryColor",    source = "task.category.color")
    @Mapping(target = "parentTaskId",     source = "task.parentTask.taskId")
    @Mapping(target = "dependsOnTaskIds", expression = "java(extractDependsOnIds(task))")
    @Mapping(target = "isOverdue",        expression = "java(isOverdue(task))")
    GanttTaskDto toGanttTaskDto(Task task, int depth, boolean isCriticalPath);

    default List<UUID> extractDependsOnIds(Task task) {
        return task.getDependencies().stream()
                .map(dep -> dep.getDependsOnTask().getTaskId())
                .toList();
    }

    default boolean isOverdue(Task task) {
        return task.getEndDate() != null
                && task.getEndDate().isBefore(LocalDate.now())
                && task.getStatus() != TaskStatus.COMPLETED;
    }

    // ── GanttDependencyDto ────────────────────────────────────────────────────
    @Mapping(target = "fromTaskId", source = "dependsOnTask.taskId")
    @Mapping(target = "toTaskId",   source = "task.taskId")
    @Mapping(target = "type",       source = "dependencyType")
    @Mapping(target = "lagDays",    source = "lagDays")
    GanttDependencyDto toGanttDependencyDto(TaskDependency dependency);
}
