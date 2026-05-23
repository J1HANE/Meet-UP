package com.meetup.taskservice.domain.entity;

import com.meetup.taskservice.domain.enums.DependencyType;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "task_blocks")
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TaskBlock {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false)
    private UUID blockId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blocked_by_task_id")
    private Task blockedByTask;

    @Enumerated(EnumType.STRING)
    private DependencyType dependencyType;

    private String reason;

    @Column(nullable = false)
    private OffsetDateTime blockedAt;

    private OffsetDateTime unblockedAt;



    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof TaskBlock other)) return false;
        return blockId != null && blockId.equals(other.blockId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
