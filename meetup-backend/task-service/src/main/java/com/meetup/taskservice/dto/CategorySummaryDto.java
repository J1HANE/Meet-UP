package com.meetup.taskservice.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class CategorySummaryDto {
    private UUID categoryId;
    private String name;
    private String color;
    private String icon;
}
