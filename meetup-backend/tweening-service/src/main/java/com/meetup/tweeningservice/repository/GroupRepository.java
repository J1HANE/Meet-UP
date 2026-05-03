package com.meetup.tweeningservice.repository;

import com.meetup.tweeningservice.domain.node.GroupNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GroupRepository extends Neo4jRepository<GroupNode, String> {
    Optional<GroupNode> findByTaskId(String taskId);
}
