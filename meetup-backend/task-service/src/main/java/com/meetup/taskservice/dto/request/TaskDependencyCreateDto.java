package com.meetup.taskservice.dto.request;

import com.meetup.taskservice.domain.enums.DependencyType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDependencyCreateDto {
    @NotNull
    private UUID dependsOnTaskId;     // taskId comes from the path variable

    @NotNull
    private DependencyType dependencyType;

    @Min(0)
    private short          lagDays;
}
