package com.meetup.taskservice.repository;

import com.meetup.taskservice.domain.entity.Tag;
import com.meetup.taskservice.domain.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.UUID;

public interface TagRepository extends JpaRepository<Tag, UUID> {
    List<Tag> findByContextId(String contextId);
    boolean existsByName(String name);
    boolean existsByNameIgnoreCaseAndContextId(String name, String contextId);
}
