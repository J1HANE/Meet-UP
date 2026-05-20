package com.meetup.taskservice.controller;


import com.meetup.taskservice.dto.request.TagCreateDto;
import com.meetup.taskservice.dto.request.TagUpdateDto;
import com.meetup.taskservice.dto.response.TagResponseDto;
import com.meetup.taskservice.service.TagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Tag Management", description = "Endpoints for managing tags")
public class TagController {

    private final TagService tagService;

    @Operation(summary = "Get all tags", description = "Returns all tags for the given context.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tags retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Context not found", content = @Content)
    })
    @GetMapping
    public ResponseEntity<List<TagResponseDto>> getTags(@PathVariable String contextId) {
        return ResponseEntity.ok(tagService.getTags(contextId));
    }

    @Operation(summary = "Get tag by ID", description = "Returns a specific tag by its ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tag retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Tag or context not found", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<TagResponseDto> getTagById(@PathVariable UUID id, @PathVariable String contextId) {
        return ResponseEntity.ok(tagService.getTagById(contextId, id));
    }

    @Operation(summary = "Create a new tag", description = "Creates a new tag in the given context.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Tag created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content),
            @ApiResponse(responseCode = "404", description = "Context not found", content = @Content)
    })
    @PostMapping
    public ResponseEntity<TagResponseDto> createTag(@RequestBody @Valid TagCreateDto tagCreateDto, @PathVariable String contextId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tagService.createTag(contextId, tagCreateDto));
    }

    @Operation(summary = "Update a tag", description = "Updates an existing tag.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tag updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content),
            @ApiResponse(responseCode = "404", description = "Tag or context not found", content = @Content)
    })
    @PutMapping("/{id}")
    public ResponseEntity<TagResponseDto> updateTag(@PathVariable UUID id,
                                                    @RequestBody @Valid TagUpdateDto tagUpdateDto,
                                                    @PathVariable String contextId) {
        return ResponseEntity.ok(tagService.updateTag(contextId, id, tagUpdateDto));
    }

    @Operation(summary = "Delete a tag", description = "Deletes a tag from the given context.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Tag deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Tag or context not found", content = @Content)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable UUID id, @PathVariable String contextId) {
        tagService.deleteTag(contextId, id);
        return ResponseEntity.noContent().build();
    }
}