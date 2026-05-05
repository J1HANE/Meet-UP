package com.meetup.taskservice.repository;

import com.meetup.taskservice.domain.entity.Task;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.List;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findByContextId(String contextId);

    @Query("""
            SELECT DISTINCT t FROM Task t
            LEFT JOIN FETCH t.category
            LEFT JOIN FETCH t.parentTask
            LEFT JOIN FETCH t.subTasks
            LEFT JOIN FETCH t.dependencies d
            LEFT JOIN FETCH d.dependsOnTask
            LEFT JOIN FETCH t.dependents
            WHERE t.contextId = :contextId
              AND t.deletedAt IS NULL
            """)
    List<Task> findAllWithRelations(@Param("contextId") String contextId);

    @Query("""
            SELECT DISTINCT t FROM Task t
            LEFT JOIN FETCH t.category
            LEFT JOIN FETCH t.parentTask
            LEFT JOIN FETCH t.subTasks
            LEFT JOIN FETCH t.dependencies d
            LEFT JOIN FETCH d.dependsOnTask
            LEFT JOIN FETCH t.dependents
            WHERE t.category.categoryId = :categoryId
              AND t.contextId = :contextId
              AND t.deletedAt IS NULL
            """)
    List<Task> findAllWithRelationsByCategoryId(@Param("categoryId") UUID categoryId, @Param("contextId") String contextId);

}
