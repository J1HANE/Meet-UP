package com.meetup.taskservice.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponseDto {
    private UUID categoryId;
    private String name;
    private String description;
    private String color;
    private String icon;
    @JsonProperty("isActive")
    private boolean active;
    private int taskCount;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
