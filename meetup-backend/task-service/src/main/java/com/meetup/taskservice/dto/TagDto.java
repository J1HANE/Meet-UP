package com.meetup.taskservice.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class TagDto {
    private UUID tagId;
    private String name;
    private String color;
    private String icon;
}
