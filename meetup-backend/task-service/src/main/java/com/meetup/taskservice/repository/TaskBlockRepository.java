package com.meetup.taskservice.repository;

import com.meetup.taskservice.domain.entity.TaskBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskBlockRepository extends JpaRepository<TaskBlock, UUID> {
    List<TaskBlock> findByTask_TaskId(UUID taskId);

    @Query("SELECT b FROM TaskBlock b WHERE b.task.taskId = :taskId " +
            "AND b.blockedByTask.taskId = :blockedByTaskId " +
            "AND b.unblockedAt IS NULL")
    Optional<TaskBlock> findOpenByTask_TaskIdAndBlockedByTask_TaskId(
            @Param("taskId") UUID taskId,
            @Param("blockedByTaskId") UUID blockedByTaskId
    );
}
