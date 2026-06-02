package com.meetup.taskservice.repository;

import com.meetup.taskservice.domain.entity.Category;
import com.meetup.taskservice.domain.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    boolean existsByName(String name);
    List<Category> findByContextId(String contextId);
}
