package com.meetup.taskservice.dto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class TagSummary {
    private UUID tagId;

    private String name;

    private String description;
}
