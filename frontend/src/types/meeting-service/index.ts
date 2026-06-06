export interface ParticipantResponse {
  userId: string;
  displayName: string;
  role: "HOST" | "MEMBER";
  joinedAt: string;
}

export interface BackendMeetingResponse {
  id: string;
  title: string;
  tweenId: string;
  createdBy: string;
  scheduledAt: string;
  status: string;
  maxParticipants: number | null;
  streamCallId: string | null;
  streamCallType: string | null;
  streamChannelId: string | null;
  streamChannelType: string | null;
  createdAt: string;
  updatedAt: string;
  participants: ParticipantResponse[];
  notes?: string;
}

export interface BackendChatInfo {
  apiKey: string;
  channelId: string;
  channelType: string;
  userToken: string | null;
}

export interface BackendChatMessageResponse {
  id: string;
  userId: string;
  displayName: string;
  message: string;
  sentAt: string;
}

export interface BackendJoinMeetingResponse {
  meetingId: string;
  video: {
    api_key: string;
    call_id: string;
    call_type: string;
    token: string;
  };
  chat: BackendChatInfo;
  participant: ParticipantResponse;
}

export interface CreateMeetingRequest {
  title: string;
  tweenId: string;
  createdBy?: string;
  scheduledAt: string;
  maxParticipants?: number;
  createStreamCall?: boolean;
}
