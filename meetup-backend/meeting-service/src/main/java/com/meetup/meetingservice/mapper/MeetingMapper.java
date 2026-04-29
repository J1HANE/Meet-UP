package com.meetup.meetingservice.mapper;

import com.meetup.meetingservice.dto.MeetingRequest;
import com.meetup.meetingservice.dto.MeetingResponse;
import com.meetup.meetingservice.model.Meeting;
import org.springframework.stereotype.Component;

@Component
public class MeetingMapper {
    
    public Meeting toEntity(MeetingRequest request) {
        if (request == null) return null;
        Meeting meeting = new Meeting();
        meeting.setTitle(request.getTitle());
        meeting.setDescription(request.getDescription());
        meeting.setStartTime(request.getStartTime());
        return meeting;
    }
    
    public MeetingResponse toResponse(Meeting meeting) {
        if (meeting == null) return null;
        MeetingResponse response = new MeetingResponse();
        response.setId(meeting.getId());
        response.setTitle(meeting.getTitle());
        response.setDescription(meeting.getDescription());
        response.setStartTime(meeting.getStartTime());
        response.setStatus(meeting.getStatus());
        response.setMeetingLink("http://localhost:3000/meeting/" + meeting.getId());
        return response;
    }
}
