package com.meetup.taskservice.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "task_blocks")
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


    private String blockedBy;

    private String reason;

    @Column(nullable = false)
    private OffsetDateTime blockedAt = OffsetDateTime.now();

    private OffsetDateTime unblockedAt;


    private String resolvedBy;


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
