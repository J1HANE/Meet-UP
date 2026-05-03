package com.meetup.taskservice.mapper;

import com.meetup.taskservice.domain.entity.Attachment;
import com.meetup.taskservice.dto.AttachmentSummaryDto;
import com.meetup.taskservice.dto.request.AttachmentCreateDto;
import com.meetup.taskservice.dto.request.AttachmentUpdateDto;
import com.meetup.taskservice.dto.response.AttachmentResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AttachmentMapper {

    // ─── Entity → Response DTO ────────────────────────────────────────────────

    @Mapping(target = "fileSizeKb",  expression = "java(Math.round(attachment.getFileSizeBytes() / 1024.0 * 100.0) / 100.0)")
    @Mapping(target = "isDeleted",   expression = "java(attachment.getDeletedAt() != null)")
    @Mapping(target = "hasThumbnail", expression = "java(attachment.getThumbnailUrl() != null)")
    AttachmentResponseDto toResponseDto(Attachment attachment);

    // ─── Entity → Summary DTO (lightweight, for embedding in Task response) ───

    AttachmentSummaryDto toSummaryDto(Attachment attachment);

    // ─── Create DTO → Entity ──────────────────────────────────────────────────

    @Mapping(target = "attachmentId", ignore = true)
    @Mapping(target = "uploadedAt",   expression = "java(java.time.OffsetDateTime.now())")
    @Mapping(target = "deletedAt",    ignore = true)
    // storageUrl + thumbnailUrl resolved after upload in service, not from client
    @Mapping(target = "storageUrl",   ignore = true)
    @Mapping(target = "thumbnailUrl", ignore = true)
    @Mapping(target = "uploadedBy",   ignore = true)
    Attachment toEntity(AttachmentCreateDto dto);

    // ─── Soft-delete patch ────────────────────────────────────────────────────

//    @Mapping(target = "attachmentId",      ignore = true)
//    @Mapping(target = "entityType",        ignore = true)
//    @Mapping(target = "entityId",          ignore = true)
//    @Mapping(target = "fileName",          ignore = true)
//    @Mapping(target = "mimeType",          ignore = true)
//    @Mapping(target = "fileSizeBytes",     ignore = true)
//    @Mapping(target = "storageUrl",        ignore = true)
//    @Mapping(target = "thumbnailUrl",      ignore = true)
//    @Mapping(target = "description",       ignore = true)
//    @Mapping(target = "uploadedBy",        ignore = true)
//    @Mapping(target = "uploadedAt",        ignore = true)
//    @Mapping(target = "deletedAt",         expression = "java(java.time.OffsetDateTime.now())")
//    void softDelete(@MappingTarget Attachment attachment);

    // ─── Metadata update (description only) ──────────────────────────────────

    @Mapping(target = "attachmentId",  ignore = true)
    @Mapping(target = "entityType",    ignore = true)
    @Mapping(target = "entityId",      ignore = true)
    @Mapping(target = "fileName",      ignore = true)
    @Mapping(target = "mimeType",      ignore = true)
    @Mapping(target = "fileSizeBytes", ignore = true)
    @Mapping(target = "storageUrl",    ignore = true)
    @Mapping(target = "thumbnailUrl",  ignore = true)
    @Mapping(target = "uploadedBy",    ignore = true)
    @Mapping(target = "uploadedAt",    ignore = true)
    @Mapping(target = "deletedAt",     ignore = true)
    void updateMetadata(AttachmentUpdateDto dto, @MappingTarget Attachment attachment);

    // ─── List mappings ────────────────────────────────────────────────────────

    List<AttachmentResponseDto>  toResponseDtoList(List<Attachment> attachments);
    List<AttachmentSummaryDto>   toSummaryDtoList(List<Attachment> attachments);
}
