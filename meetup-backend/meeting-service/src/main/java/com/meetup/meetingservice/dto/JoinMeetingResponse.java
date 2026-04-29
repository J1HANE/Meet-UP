package com.meetup.meetingservice.dto;

public class JoinMeetingResponse {
    private String meetingId;
    private VideoInfo video;
    private ChatInfo chat;

    public String getMeetingId() { return meetingId; }
    public void setMeetingId(String meetingId) { this.meetingId = meetingId; }

    public VideoInfo getVideo() { return video; }
    public void setVideo(VideoInfo video) { this.video = video; }

    public ChatInfo getChat() { return chat; }
    public void setChat(ChatInfo chat) { this.chat = chat; }

    public static class VideoInfo {
        private String callType;
        private String callId;
        private String token;

        public String getCallType() { return callType; }
        public void setCallType(String callType) { this.callType = callType; }

        public String getCallId() { return callId; }
        public void setCallId(String callId) { this.callId = callId; }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }

    public static class ChatInfo {
        private String apiKey;
        private String channelType;
        private String channelId;
        private String userToken;

        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }

        public String getChannelType() { return channelType; }
        public void setChannelType(String channelType) { this.channelType = channelType; }

        public String getChannelId() { return channelId; }
        public void setChannelId(String channelId) { this.channelId = channelId; }

        public String getUserToken() { return userToken; }
        public void setUserToken(String userToken) { this.userToken = userToken; }
    }
}
