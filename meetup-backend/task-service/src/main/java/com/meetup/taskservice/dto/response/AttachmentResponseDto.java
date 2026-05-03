package com.meetup.taskservice.dto.response;

import com.meetup.taskservice.domain.enums.AttachmentEntityType;
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
public class AttachmentResponseDto {
    private UUID attachmentId;
    private AttachmentEntityType entityType;
    private UUID                 entityId;
    private String               fileName;
    private String               mimeType;
    private long                 fileSizeBytes;
    private double               fileSizeKb;      // derived: rounded to 2 decimal places
    private String               storageUrl;
    private String               thumbnailUrl;
    private boolean              hasThumbnail;    // derived: thumbnailUrl != null
    private String               description;
    private String               uploadedBy;
    private OffsetDateTime uploadedAt;
    private boolean              isDeleted;// derived: deletedAt != null
    // deletedAt intentionally omitted — internal audit only
}
