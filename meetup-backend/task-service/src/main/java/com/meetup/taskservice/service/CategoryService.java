package com.meetup.taskservice.service;

import com.meetup.taskservice.domain.entity.Category;
import com.meetup.taskservice.domain.entity.Tag;
import com.meetup.taskservice.domain.entity.Task;
import com.meetup.taskservice.dto.request.CategoryCreateDto;
import com.meetup.taskservice.dto.request.CategoryUpdateDto;
import com.meetup.taskservice.dto.response.CategoryResponseDto;
import com.meetup.taskservice.dto.response.TaskResponseDto;
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

    public List<CategoryResponseDto> getCategories(String contextId) {
        return categoryRepository.findByContextId(contextId)
                .stream()
                .map(categoryMapper::toResponseDto)
                .toList();
    }

    public CategoryResponseDto getCategoryById(UUID id) {
        Category category = categoryRepository.findById(id).orElseThrow(
                () -> new EntityNotFoundException("Category not found with ID: " + id)
        );
        return categoryMapper.toResponseDto(category);
    }



    public CategoryResponseDto createCategory(String contextId, CategoryCreateDto categoryCreateDto) {

        if (categoryRepository.existsByName(categoryCreateDto.getName())) {
            throw new EntityAlreadyExistsException(
                    "A category with this name " + "already exists"
                            + categoryCreateDto.getName());
        }

        Category newCategory = categoryMapper.toEntity(categoryCreateDto);
        newCategory.setContextId(contextId);
        newCategory = categoryRepository.save(newCategory);
        return categoryMapper.toResponseDto(newCategory);
    }

    public CategoryResponseDto updateCategory(String contextId, UUID id, CategoryUpdateDto categoryUpdateDto) {

        Category category = findCategory(contextId, id);

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

    public void deleteCategory(String contextId, UUID id) {
        findCategory(contextId, id);
        categoryRepository.deleteById(id);
    }



    //Helper functions
    private Category findCategory(String contextId, UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found with ID: " + categoryId));
        if (!category.getContextId().equals(contextId)) {
            throw new EntityNotFoundException("Category not found with ID: " + categoryId);
        }
        return category;
    }


}
