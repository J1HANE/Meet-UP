package com.meetup.meetingservice.repository;

import com.meetup.meetingservice.model.Meeting;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public class FirebaseMeetingRepositoryImpl implements MeetingRepository {

    // Mock implementation for now, later connected to Firebase Admin SDK
    private final Map<String, Meeting> storage = new HashMap<>();

    @Override
    public Meeting save(Meeting meeting) {
        if (meeting.getId() == null) {
            meeting.setId(UUID.randomUUID().toString());
        }
        storage.put(meeting.getId(), meeting);
        return meeting;
    }

    @Override
    public Optional<Meeting> findById(String id) {
        return Optional.ofNullable(storage.get(id));
    }

    @Override
    public List<Meeting> findAll() {
        return new ArrayList<>(storage.values());
    }

    @Override
    public void deleteById(String id) {
        storage.remove(id);
    }
}
