package com.meetup.taskservice.domain.audit;

import com.meetup.taskservice.domain.enums.AuditOperation;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "audit_logs",
        indexes = {
                @Index(name = "idx_audit_entity",     columnList = "table_name, entity_id"),
                @Index(name = "idx_audit_changed_by", columnList = "changed_by"),
                @Index(name = "idx_audit_changed_at", columnList = "changed_at DESC"),
                @Index(name = "idx_audit_operation",  columnList = "operation")
        }
)
public class AuditLog {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid", updatable = false)
    private UUID auditId;

    // What was touched
    @Column(nullable = false)
    private String tableName;

    @Column(nullable = false)
    private UUID entityId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditOperation operation;

    // What changed — stored as JSONB
    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String oldData;

    @Column(columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private String newData;

    // Column names that changed — stored as TEXT[]
    @Column(columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private String[] changedFields;

    // Who and when — no @ManyToOne, same rule as before
    @Column(name = "changed_by")
    private UUID changedBy;

    @Column(nullable = false, updatable = false)
    private OffsetDateTime changedAt = OffsetDateTime.now();

    // Optional app context e.g. "api:PATCH /tasks/:id"
    private String appContext;
}
