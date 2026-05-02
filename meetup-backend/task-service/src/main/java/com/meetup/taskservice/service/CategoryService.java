package com.meetup.taskservice.service;

import com.meetup.taskservice.domain.entity.Category;
import com.meetup.taskservice.dto.request.CategoryCreateDto;
import com.meetup.taskservice.dto.request.CategoryUpdateDto;
import com.meetup.taskservice.dto.response.CategoryResponseDto;
import com.meetup.taskservice.exception.EntityAlreadyExistsException;
import com.meetup.taskservice.exception.EntityNotFoundException;
import com.meetup.taskservice.mapper.CategoryMapper;
import com.meetup.taskservice.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public List<CategoryResponseDto> getCategories() {
        List<Category> categories = categoryRepository.findAll();

        return categories.stream().map(categoryMapper::toResponseDto).toList();
    }


    public CategoryResponseDto createCategory(CategoryCreateDto categoryCreateDto) {

        if (categoryRepository.existsByName(categoryCreateDto.getName())) {
            throw new EntityAlreadyExistsException(
                    "A category with this name " + "already exists"
                            + categoryCreateDto.getName());
        }

        Category newCategory = categoryRepository.save(categoryMapper.toEntity(categoryCreateDto));
        //Publish event to kafka
        return categoryMapper.toResponseDto(newCategory);
    }

    public CategoryResponseDto updateCategory(UUID id, CategoryUpdateDto categoryUpdateDto) {
        Category category = categoryRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Category not found with ID: " + id));

        boolean hasChanges = false;

        if (categoryUpdateDto.getName() != null && !categoryUpdateDto.getName().equals(category.getName())) {
            category.setName(categoryUpdateDto.getName());
            hasChanges = true;
        }

        if (categoryUpdateDto.getDescription() != null && !categoryUpdateDto.getDescription().equals(category.getDescription())) {
            category.setDescription(categoryUpdateDto.getDescription());
            hasChanges = true;
        }

        if (categoryUpdateDto.getColor() != null && !categoryUpdateDto.getColor().equals(category.getColor())) {
            category.setColor(categoryUpdateDto.getColor());
            hasChanges = true;
        }

        if (categoryUpdateDto.getIcon() != null && !categoryUpdateDto.getIcon().equals(category.getIcon())) {
            category.setIcon(categoryUpdateDto.getIcon());
            hasChanges = true;
        }

        if (!hasChanges) {
            return categoryMapper.toResponseDto(category);
        }

        Category updatedCategory = categoryRepository.save(category);
        return categoryMapper.toResponseDto(updatedCategory);
    }

    public void deleteCategory(UUID id) {
        categoryRepository.deleteById(id);
    }
}
