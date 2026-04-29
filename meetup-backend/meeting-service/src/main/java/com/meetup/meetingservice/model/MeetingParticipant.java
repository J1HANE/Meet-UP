package com.meetup.meetingservice.model;

public class MeetingParticipant {
    private String userId;
    private ParticipantRole role;
    private String streamUserToken;
    private boolean joined;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public ParticipantRole getRole() { return role; }
    public void setRole(ParticipantRole role) { this.role = role; }
    
    public String getStreamUserToken() { return streamUserToken; }
    public void setStreamUserToken(String streamUserToken) { this.streamUserToken = streamUserToken; }
    
    public boolean isJoined() { return joined; }
    public void setJoined(boolean joined) { this.joined = joined; }
}
