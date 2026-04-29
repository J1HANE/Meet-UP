package com.meetup.tweeningservice.domain.node;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;
import com.meetup.tweeningservice.domain.relationship.CollaboratedWith;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.data.neo4j.core.schema.Relationship.Direction.OUTGOING;

@Node("Person")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonNode {

    @Id
    private String id;

    private String name;

    private String email;

    private String role;

    @Relationship(type = "COLLABORATED_WITH", direction = OUTGOING)
    @Builder.Default
    private List<CollaboratedWith> collaborations = new ArrayList<>();

    // Helper to add or update a collaboration edge
    public void addOrUpdateCollaboration(CollaboratedWith collaboration) {
        collaborations.stream()
                .filter(c -> c.getPerson().getId().equals(collaboration.getPerson().getId()))
                .findFirst()
                .ifPresentOrElse(
                        existing -> {
                            existing.setWeight(existing.getWeight() + collaboration.getWeight());
                            existing.setLastCollaboration(collaboration.getLastCollaboration());
                        },
                        () -> collaborations.add(collaboration)
                );
    }

    // Helper to check if already collaborating with someone
    public boolean hasCollaboratedWith(String personId) {
        return collaborations.stream()
                .anyMatch(c -> c.getPerson().getId().equals(personId));
    }
}