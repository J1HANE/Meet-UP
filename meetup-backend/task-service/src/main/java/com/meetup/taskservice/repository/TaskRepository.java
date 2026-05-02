package com.meetup.taskservice.repository;

import com.meetup.taskservice.domain.entity.Task;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;

import java.util.UUID;

public interface TaskRepository extends PagingAndSortingRepository<Task, UUID>, CrudRepository<Task, UUID> {

}
