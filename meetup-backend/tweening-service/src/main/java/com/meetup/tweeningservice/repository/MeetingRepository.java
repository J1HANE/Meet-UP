package com.meetup.tweeningservice.repository;

import com.meetup.tweeningservice.domain.node.MeetingNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MeetingRepository extends Neo4jRepository<MeetingNode, String> {
}
