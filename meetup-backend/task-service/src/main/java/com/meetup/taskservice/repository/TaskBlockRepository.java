package com.meetup.taskservice.repository;

import com.meetup.taskservice.domain.entity.TaskBlock;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;
import java.util.UUID;

public interface TaskBlockRepository extends JpaRepository<TaskBlock, UUID> {
    List<TaskBlock> findByTask_TaskId(UUID taskId);
}
