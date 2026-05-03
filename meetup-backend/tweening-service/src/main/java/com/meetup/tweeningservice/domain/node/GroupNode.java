package com.meetup.tweeningservice.domain.node;

import com.meetup.tweeningservice.domain.relationship.FormedIn;
import com.meetup.tweeningservice.domain.relationship.Leads;
import com.meetup.tweeningservice.domain.relationship.MemberOf;
import com.meetup.tweeningservice.domain.relationship.SiblingGroup;
import com.meetup.tweeningservice.domain.relationship.WorksOn;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.springframework.data.neo4j.core.schema.Relationship.Direction.INCOMING;
import static org.springframework.data.neo4j.core.schema.Relationship.Direction.OUTGOING;

@Node("Group")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupNode {

    @Id
    private String id;

    private String name;

    private String state; // LATENT, FORMING, ACTIVE, EVOLVING, DISSOLVED

    private String taskId;

    private LocalDateTime createdAt;

    private LocalDateTime dissolvedAt;

    @Relationship(type = "MEMBER_OF", direction = INCOMING)
    @Builder.Default
    private List<MemberOf> members = new ArrayList<>();

    @Relationship(type = "WORKS_ON", direction = OUTGOING)
    private WorksOn task;

    @Relationship(type = "FORMED_IN", direction = OUTGOING)
    private FormedIn meeting;

    @Relationship(type = "LEADS", direction = INCOMING)
    @Builder.Default
    private List<Leads> leads = new ArrayList<>();

    @Relationship(type = "SIBLING_OF", direction = OUTGOING)
    @Builder.Default
    private List<SiblingGroup> siblings = new ArrayList<>();
}
