package com.meetup.taskservice.controller;



import com.meetup.taskservice.dto.request.CategoryCreateDto;
import com.meetup.taskservice.dto.request.CategoryUpdateDto;
import com.meetup.taskservice.dto.response.CategoryResponseDto;
import com.meetup.taskservice.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Get Categories")
    public ResponseEntity<List<CategoryResponseDto>> getCategories() {
        List<CategoryResponseDto> categories = categoryService.getCategories();
        return ResponseEntity.ok().body(categories);
    }

    @PostMapping
    @Operation(summary = "Create a new Category")
    public ResponseEntity<CategoryResponseDto> createCategory(
            @Valid @RequestBody CategoryCreateDto categoryCreateDto) {

        CategoryResponseDto categoryResponseDto = categoryService.createCategory(categoryCreateDto);

        return ResponseEntity.ok().body(categoryResponseDto);
    }


    @PutMapping("/{id}")
    @Operation(summary = "Update a Category")
    public ResponseEntity<CategoryResponseDto> updateCategory(@PathVariable UUID id,
                                                            @Valid @RequestBody CategoryUpdateDto categoryUpdateDto) {

        CategoryResponseDto categoryResponseDto = categoryService.updateCategory(id,
                categoryUpdateDto);

        return ResponseEntity.ok().body(categoryResponseDto);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a Category")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
