package com.meetup.taskservice.repository;

import com.meetup.taskservice.domain.entity.Tag;
import org.springframework.data.repository.CrudRepository;

import java.util.UUID;

public interface TagRepository extends CrudRepository<Tag, UUID> {
}
