package com.meetup.taskservice.repository;


import com.meetup.taskservice.domain.entity.TaskDependency;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;
import java.util.UUID;

public interface TaskDependencyRepository extends JpaRepository<TaskDependency, UUID> {
    List<TaskDependency> findByTask_TaskId(UUID taskId);
    List<TaskDependency> findByDependsOnTask_TaskId(UUID dependsOnTaskId);
    boolean existsByTask_TaskIdAndDependsOnTask_TaskId(UUID taskId, UUID dependsOnTaskId);
}
