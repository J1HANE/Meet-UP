package com.meetup.meetingservice.repository;

import com.meetup.meetingservice.model.Meeting;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MeetingRepository {
    Meeting save(Meeting meeting);

    List<Meeting> findAll();

    Optional<Meeting> findById(UUID meetingId);
}
