package com.meetup.taskservice.domain.entity;


import com.meetup.taskservice.config.TaskServiceConfig;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Category {
    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false)
    private UUID categoryId;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Column(length = TaskServiceConfig.COLOR_CODE_LENGTH)
    private String color;

    private String icon;

    @Column(nullable = false)
    private boolean isActive = true;

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    private List<Task> tasks = new ArrayList<>();

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private OffsetDateTime updatedAt;


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Category other)) return false;
        return categoryId != null && categoryId.equals(other.categoryId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
