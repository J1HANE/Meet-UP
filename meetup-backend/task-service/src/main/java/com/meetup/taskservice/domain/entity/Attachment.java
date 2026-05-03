package com.meetup.taskservice.domain.entity;

import com.meetup.taskservice.domain.enums.AttachmentEntityType;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "attachments")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Attachment {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false)
    private UUID attachmentId;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttachmentEntityType entityType = AttachmentEntityType.TASK;

    @Column(nullable = false)
    private UUID entityId;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String mimeType;

    @Column(nullable = false)
    private long fileSizeBytes;

    @Column(nullable = false)
    private String storageUrl;

    private String thumbnailUrl;
    private String description;


    private String uploadedBy;

    @Column(nullable = false)
    private OffsetDateTime uploadedAt = OffsetDateTime.now();

    private OffsetDateTime deletedAt;


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Attachment other)) return false;
        return attachmentId != null && attachmentId.equals(other.attachmentId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
