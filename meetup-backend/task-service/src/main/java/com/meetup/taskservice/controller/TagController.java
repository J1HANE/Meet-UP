package com.meetup.taskservice.controller;


import com.meetup.taskservice.dto.request.TagCreateDto;
import com.meetup.taskservice.dto.request.TagUpdateDto;
import com.meetup.taskservice.dto.response.TagResponseDto;
import com.meetup.taskservice.service.TagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/context/{contextId}/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @GetMapping
    public ResponseEntity<List<TagResponseDto>> getTags(@PathVariable String contextId) {
        return ResponseEntity.ok(tagService.getTags(contextId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TagResponseDto> getTagById(@PathVariable UUID id, @PathVariable String contextId) {
        return ResponseEntity.ok(tagService.getTagById(contextId, id));
    }

    @PostMapping
    public ResponseEntity<TagResponseDto> createTag(@RequestBody @Valid TagCreateDto tagCreateDto, @PathVariable String contextId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tagService.createTag(contextId, tagCreateDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TagResponseDto> updateTag(@PathVariable UUID id,
                                                    @RequestBody @Valid TagUpdateDto tagUpdateDto, @PathVariable String contextId) {
        return ResponseEntity.ok(tagService.updateTag(contextId, id, tagUpdateDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable UUID id, @PathVariable String contextId) {
        tagService.deleteTag(contextId, id);
        return ResponseEntity.noContent().build();
    }
}
