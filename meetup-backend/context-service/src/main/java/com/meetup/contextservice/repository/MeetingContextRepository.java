package com.meetup.contextservice.repository;

import com.meetup.contextservice.model.MeetingContext;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MeetingContextRepository extends MongoRepository<MeetingContext, String> {
    Optional<MeetingContext> findByMeetingId(UUID meetingId);
    
    // Query for prior sessions shared by the same participants
    List<MeetingContext> findByParticipantIdsIn(List<UUID> participantIds);
    
    // Query for prior sessions for a specific tween group
    List<MeetingContext> findByTweenGroupIdsIn(List<UUID> tweenGroupIds);
}
