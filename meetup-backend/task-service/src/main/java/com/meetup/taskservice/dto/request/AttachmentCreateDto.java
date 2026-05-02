package com.meetup.taskservice.dto.request;

import com.meetup.taskservice.domain.enums.AttachmentEntityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttachmentCreateDto {

    @NotNull
    private AttachmentEntityType entityType;

    @NotNull
    private UUID entityId;

    @NotBlank
    private String fileName;

    @NotBlank
    private String mimeType;

    @Positive
    private long   fileSizeBytes;

    private String description;

    // uploadedBy  → resolved from SecurityContext in service
    // storageUrl  → set after upload completes in service
    // thumbnailUrl→ set after thumbnail generation in service
}
