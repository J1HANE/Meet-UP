package com.meetup.taskservice.controller;



import com.meetup.taskservice.dto.request.CategoryCreateDto;
import com.meetup.taskservice.dto.request.CategoryUpdateDto;
import com.meetup.taskservice.dto.response.CategoryResponseDto;
import com.meetup.taskservice.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks/categories")
@RequiredArgsConstructor
@Tag(name = "Category Management", description = "Endpoints for managing categories")
public class CategoryController {
    private final CategoryService categoryService;

    @Operation(summary = "Get all categories", description = "Returns all available categories.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Categories retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "No categories found", content = @Content)
    })
    @GetMapping
    public ResponseEntity<List<CategoryResponseDto>> getCategories() {
        List<CategoryResponseDto> categories = categoryService.getCategories();
        return ResponseEntity.ok().body(categories);
    }

    @Operation(summary = "Create a new category", description = "Creates a new category.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Category created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content)
    })
    @PostMapping
    public ResponseEntity<CategoryResponseDto> createCategory(
            @Valid @RequestBody CategoryCreateDto categoryCreateDto) {

        CategoryResponseDto categoryResponseDto = categoryService.createCategory(categoryCreateDto);

        return ResponseEntity.ok().body(categoryResponseDto);
    }

    @Operation(summary = "Update a category", description = "Updates an existing category.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Category updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content),
            @ApiResponse(responseCode = "404", description = "Category not found", content = @Content)
    })
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponseDto> updateCategory(@PathVariable UUID id,
                                                              @Valid @RequestBody CategoryUpdateDto categoryUpdateDto) {

        CategoryResponseDto categoryResponseDto = categoryService.updateCategory(id,
                categoryUpdateDto);

        return ResponseEntity.ok().body(categoryResponseDto);
    }

    @Operation(summary = "Delete a category", description = "Deletes a category.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Category deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Category not found", content = @Content)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
