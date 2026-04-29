package com.meetup.meetingservice.repository;

import com.meetup.meetingservice.model.Meeting;
import java.util.List;
import java.util.Optional;

public interface MeetingRepository {
    Meeting save(Meeting meeting);
    Optional<Meeting> findById(String id);
    List<Meeting> findAll();
    void deleteById(String id);
}
