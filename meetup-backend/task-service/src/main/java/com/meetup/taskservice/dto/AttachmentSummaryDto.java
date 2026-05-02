package com.meetup.taskservice.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AttachmentSummaryDto {
    private UUID attachmentId;
    private String fileName;
    private String mimeType;
    private long   fileSizeBytes;
    private String thumbnailUrl;
    private String storageUrl;
}
