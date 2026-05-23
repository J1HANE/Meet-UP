package com.meetup.tweeningservice.repository;

import com.meetup.tweeningservice.domain.node.GroupNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRepository extends Neo4jRepository<GroupNode, String> {
    Optional<GroupNode> findByTaskId(String taskId);

    @Query("MATCH (g:Group)-[:FORMED_IN]->(m:Meeting {id: $meetingId}) RETURN g")
    List<GroupNode> findByMeetingId(String meetingId);
}
