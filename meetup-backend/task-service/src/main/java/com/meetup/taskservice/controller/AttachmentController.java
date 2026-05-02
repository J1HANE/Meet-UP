package com.meetup.taskservice.controller;

import com.meetup.taskservice.dto.request.AttachmentCreateDto;
import com.meetup.taskservice.dto.request.AttachmentUpdateDto;
import com.meetup.taskservice.dto.response.AttachmentResponseDto;
import com.meetup.taskservice.service.AttachmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tasks/{taskId}/attachments")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    @GetMapping
    public ResponseEntity<List<AttachmentResponseDto>> getAttachments(@PathVariable UUID taskId) {
        return ResponseEntity.ok(attachmentService.getAttachmentsByTask(taskId));
    }

    @GetMapping("/{attachmentId}")
    public ResponseEntity<AttachmentResponseDto> getAttachment(@PathVariable UUID taskId,
                                                               @PathVariable UUID attachmentId) {
        return ResponseEntity.ok(attachmentService.getAttachmentById(taskId, attachmentId));
    }

    @PostMapping
    public ResponseEntity<AttachmentResponseDto> createAttachment(@PathVariable UUID taskId,
                                                                  @RequestBody @Valid AttachmentCreateDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attachmentService.createAttachment(taskId, dto));
    }

    @PatchMapping("/{attachmentId}")
    public ResponseEntity<AttachmentResponseDto> updateAttachment(@PathVariable UUID taskId,
                                                                  @PathVariable UUID attachmentId,
                                                                  @RequestBody @Valid AttachmentUpdateDto dto) {
        return ResponseEntity.ok(attachmentService.updateAttachment(taskId, attachmentId, dto));
    }

    @DeleteMapping("/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable UUID taskId,
                                                 @PathVariable UUID attachmentId) {
        attachmentService.deleteAttachment(taskId, attachmentId);
        return ResponseEntity.noContent().build();
    }
}
