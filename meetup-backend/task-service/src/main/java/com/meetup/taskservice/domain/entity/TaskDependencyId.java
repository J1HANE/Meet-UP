package com.meetup.taskservice.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;


@Embeddable

public class TaskDependencyId implements Serializable {

    @Column(name = "task_id")
    private UUID taskId;

    @Column(name = "depends_on_task_id")
    private UUID dependsOnTaskId;


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TaskDependencyId other)) return false;
        return Objects.equals(taskId, other.taskId) &&
                Objects.equals(dependsOnTaskId, other.dependsOnTaskId);
    }

    @Override public int hashCode() {
        return Objects.hash(taskId, dependsOnTaskId);
    }
}
