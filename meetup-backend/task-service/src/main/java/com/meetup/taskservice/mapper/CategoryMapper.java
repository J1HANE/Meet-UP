package com.meetup.taskservice.mapper;


import com.meetup.taskservice.domain.entity.Category;
import com.meetup.taskservice.dto.CategorySummaryDto;
import com.meetup.taskservice.dto.request.CategoryCreateDto;
import com.meetup.taskservice.dto.request.CategoryUpdateDto;
import com.meetup.taskservice.dto.response.CategoryResponseDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {


    @Mapping(target = "taskCount", expression = "java(category.getTasks().size())")
    @Mapping(target = "active", source = "active")
    CategoryResponseDto toResponseDto(Category category);


    CategorySummaryDto toSummaryDto(Category category);


    @Mapping(target = "categoryId", ignore = true)
    @Mapping(target = "tasks", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "active",   ignore = true)
    Category toEntity(CategoryCreateDto createDto);


//    @Mapping(target = "categoryId", ignore = true)
//    @Mapping(target = "tasks", ignore = true)
//    @Mapping(target = "createdAt", ignore = true)
//    @Mapping(target = "updatedAt", ignore = true)
//    @Mapping(target = "isActive", ignore = true)
//    void updateEntityFromDto(CategoryUpdateDto updateDto, @MappingTarget Category category);


    List<CategoryResponseDto> toResponseDtoList(List<Category> categories);
}
