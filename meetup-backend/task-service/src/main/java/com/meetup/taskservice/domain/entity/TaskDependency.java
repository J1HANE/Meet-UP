package com.meetup.taskservice.domain.entity;

import com.meetup.taskservice.domain.enums.DependencyType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "task_dependencies")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TaskDependency {

    @EmbeddedId
    private TaskDependencyId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("taskId")
    @JoinColumn(name = "task_id")
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("dependsOnTaskId")
    @JoinColumn(name = "depends_on_task_id")
    private Task dependsOnTask;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DependencyType dependencyType = DependencyType.FINISH_TO_START;

    @Column(nullable = false)
    private short lagDays = 0;
}