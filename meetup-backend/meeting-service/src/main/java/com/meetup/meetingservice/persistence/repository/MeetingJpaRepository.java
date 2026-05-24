package com.meetup.meetingservice.persistence.repository;

import com.meetup.meetingservice.persistence.entity.MeetingEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MeetingJpaRepository extends JpaRepository<MeetingEntity, UUID> {
    List<MeetingEntity> findAllByOrderByCreatedAtAsc();
}
