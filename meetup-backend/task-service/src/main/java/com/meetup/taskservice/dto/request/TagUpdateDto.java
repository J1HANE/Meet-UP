package com.meetup.taskservice.dto.request;

import com.meetup.taskservice.config.TaskServiceConfig;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TagUpdateDto {

    @NotBlank
    private String name;

    private String description;

    @Size(max = TaskServiceConfig.COLOR_CODE_LENGTH)
    private String color;

    private String icon;
}
