package com.meetup.taskservice.repository;

import com.meetup.taskservice.domain.entity.TaskBlock;
import org.springframework.data.repository.CrudRepository;

import java.util.UUID;

public interface TaskBlockRepository extends CrudRepository<TaskBlock, UUID> {
}
