package com.meetup.taskservice.service;

import com.meetup.taskservice.domain.entity.Attachment;
import com.meetup.taskservice.domain.enums.AttachmentEntityType;
import com.meetup.taskservice.dto.request.AttachmentCreateDto;
import com.meetup.taskservice.dto.request.AttachmentUpdateDto;
import com.meetup.taskservice.dto.response.AttachmentResponseDto;
import com.meetup.taskservice.exception.EntityNotFoundException;
import com.meetup.taskservice.mapper.AttachmentMapper;
import com.meetup.taskservice.repository.AttachmentRepository;
import com.meetup.taskservice.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AttachmentService {
    private final AttachmentRepository attachmentRepository;
    private final TaskRepository taskRepository;
    private final AttachmentMapper attachmentMapper;

    public List<AttachmentResponseDto> getAttachmentsByTask(UUID taskId) {
        return attachmentRepository.findByEntityIdAndEntityType(taskId, AttachmentEntityType.TASK)
                .stream()
                .map(attachmentMapper::toResponseDto)
                .toList();
    }

    public AttachmentResponseDto getAttachmentById(UUID taskId, UUID attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId).orElseThrow(
                () -> new EntityNotFoundException("Attachment not found with ID: " + attachmentId));
        return attachmentMapper.toResponseDto(attachment);
    }

    public AttachmentResponseDto createAttachment(UUID taskId, AttachmentCreateDto dto) {
        if (!taskRepository.existsById(taskId)) {
            throw new EntityNotFoundException("Task not found with ID: " + taskId);
        }

        Attachment attachment = attachmentMapper.toEntity(dto);
        attachment.setEntityId(taskId);
        attachment.setEntityType(AttachmentEntityType.TASK);
        // attachment.setUploadedBy(currentUserId); // from SecurityContext
        // attachment.setStorageUrl(...);           // after upload

        return attachmentMapper.toResponseDto(attachmentRepository.save(attachment));
    }

    public AttachmentResponseDto updateAttachment(UUID taskId, UUID attachmentId, AttachmentUpdateDto dto) {
        Attachment attachment = attachmentRepository.findById(attachmentId).orElseThrow(
                () -> new EntityNotFoundException("Attachment not found with ID: " + attachmentId));

        if (dto.getDescription() != null && !dto.getDescription().equals(attachment.getDescription())) {
            attachmentMapper.updateMetadata(dto, attachment);
            return attachmentMapper.toResponseDto(attachmentRepository.save(attachment));
        }

        return attachmentMapper.toResponseDto(attachment);
    }

    public void deleteAttachment(UUID taskId, UUID attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId).orElseThrow(
                () -> new EntityNotFoundException("Attachment not found with ID: " + attachmentId));
        //TODO: Worry about soft deletes
        //attachmentMapper.softDelete(attachment);
        attachmentRepository.save(attachment);
    }
}
