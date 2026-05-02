package com.meetup.tweeningservice.repository;

import com.meetup.tweeningservice.domain.node.TaskNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends Neo4jRepository<TaskNode, String> {
}
