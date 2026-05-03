package com.meetup.tweeningservice.domain.relationship;

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
public class CollaboratedWith {

    @RelationshipId
    private Long id;

    private Double weight;
    private LocalDateTime lastCollaboration;

    @TargetNode
    private PersonNode person;
}
