package com.meetup.tweeningservice.repository;

import com.meetup.tweeningservice.domain.node.PersonNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonRepository extends Neo4jRepository<PersonNode, String> {

    @Query("MATCH (p:Person {id: $personId})-[c:COLLABORATED_WITH]->(collab:Person) " +
           "RETURN collab " +
           "ORDER BY c.weight DESC, c.lastCollaboration DESC")
    List<PersonNode> findCollaboratorsByRecency(String personId);

    @Query("MATCH (p:Person)-[:MEMBER_OF]->(g:Group)-[:WORKS_ON]->(t:Task) " +
           "WHERE any(tag IN t.tags WHERE tag IN $tags) " +
           "RETURN DISTINCT p")
    List<PersonNode> findPeopleBySimilarTaskTags(List<String> tags);
}
