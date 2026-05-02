package com.meetup.taskservice.domain.entity;


import com.meetup.taskservice.config.TaskServiceConfig;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "tags")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Tag {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false)
    private UUID tagId;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Column(length = TaskServiceConfig.COLOR_CODE_LENGTH)
    private String color;

    private String icon;


    @ManyToMany(mappedBy = "tags")
    private Set<Task> tasks = new HashSet<>();

    @Column(nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();


    @Column(name = "created_by", nullable = false)
    private String createdBy;


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Tag other)) return false;
        return tagId != null && tagId.equals(other.tagId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
