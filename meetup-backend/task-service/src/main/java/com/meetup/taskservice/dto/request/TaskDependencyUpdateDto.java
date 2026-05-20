package com.meetup.taskservice.dto.request;

import com.meetup.taskservice.domain.enums.DependencyType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDependencyUpdateDto {
    @NotNull
    private DependencyType dependencyType;


    private short          lagDays;

}
