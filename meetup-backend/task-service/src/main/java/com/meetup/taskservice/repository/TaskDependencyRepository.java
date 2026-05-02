package com.meetup.taskservice.repository;

import com.meetup.taskservice.domain.entity.TaskDependency;
import org.springframework.data.repository.CrudRepository;

import java.util.UUID;

public interface TaskDependencyRepository extends CrudRepository<TaskDependency, UUID> {
}
