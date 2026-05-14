package com.meetup.tweeningservice.domain.relationship;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.meetup.tweeningservice.domain.node.PersonNode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

import java.time.LocalDateTime;

@RelationshipProperties
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberOf {

    @RelationshipId
    private Long id;

    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
    private String roleInGroup;

    @TargetNode
    @JsonIgnoreProperties("collaborations")
    private PersonNode person;
}
