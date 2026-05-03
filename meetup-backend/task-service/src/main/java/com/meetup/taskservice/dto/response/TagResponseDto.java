package com.meetup.taskservice.dto.response;

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
public class TagResponseDto {

    private UUID tagId;
    private String name;
    private String description;
    private String color;
    private String icon;
    private int taskCount;
    private OffsetDateTime createdAt;
    private String createdBy;
}
