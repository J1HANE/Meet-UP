package com.meetup.tweeningservice.domain.relationship;

import com.meetup.tweeningservice.domain.node.GroupNode;
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
public class SiblingGroup {

    @RelationshipId
    private Long id;

    private LocalDateTime splitAt;

    @TargetNode
    private GroupNode sibling;
}
