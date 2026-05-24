import { meetingUserHeaders } from "@/lib/meeting-user";

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

const MEETING_API_BASE_URL = import.meta.env.VITE_MEETING_API_URL ?? (import.meta.env.VITE_API_URL || "http://localhost:8085");

export class MeetingApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "MeetingApiError";
  }
}

export interface CreateMeetingRequest {
  title: string;
  tweenId: string;
  createdBy?: string;
  scheduledAt: string;
  maxParticipants?: number;
  createStreamCall?: boolean;
}

function jsonHeaders(userId?: string, userName?: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...meetingUserHeaders(userId, userName),
  };
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function listMeetingsFromApi(userId?: string, userName?: string): Promise<BackendMeetingResponse[]> {
  const response = await fetch(`${MEETING_API_BASE_URL}/api/meetings`, {
    headers: meetingUserHeaders(userId, userName),
  });

  if (!response.ok) {
    throw new MeetingApiError("Failed to fetch meetings", response.status);
  }

  return response.json();
}

export async function createMeetingApi(
  body: CreateMeetingRequest,
  userId?: string,
  userName?: string,
): Promise<BackendMeetingResponse> {
  const response = await fetch(`${MEETING_API_BASE_URL}/api/meetings`, {
    method: "POST",
    headers: jsonHeaders(userId, userName),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new MeetingApiError("Failed to create meeting", response.status);
  }

  return response.json();
}

export async function getMeetingByIdFromApi(
  meetingId: string,
  userId?: string,
  userName?: string,
): Promise<BackendMeetingResponse> {
  const response = await fetch(`${MEETING_API_BASE_URL}/api/meetings/${meetingId}`, {
    headers: meetingUserHeaders(userId, userName),
  });

  if (!response.ok) {
    throw new MeetingApiError(`Failed to fetch meeting ${meetingId}`, response.status);
  }

  return response.json();
}

export async function joinMeetingApi(
  meetingId: string,
  userId: string,
  userName: string,
): Promise<BackendJoinMeetingResponse> {
  const response = await fetch(`${MEETING_API_BASE_URL}/api/meetings/${meetingId}/join`, {
    method: "POST",
    headers: jsonHeaders(userId, userName),
    body: JSON.stringify({ userId, userName: userName || `User ${userId.slice(0, 8)}` }),
  });

  if (!response.ok) {
    throw new MeetingApiError(`Failed to join meeting ${meetingId}`, response.status);
  }

  return response.json();
}

export async function listMeetingMessagesApi(
  meetingId: string,
  userId?: string,
  userName?: string,
): Promise<BackendChatMessageResponse[]> {
  const response = await fetch(`${MEETING_API_BASE_URL}/api/meetings/${meetingId}/messages`, {
    headers: meetingUserHeaders(userId, userName),
  });

  if (!response.ok) {
    throw new MeetingApiError(`Failed to fetch messages for meeting ${meetingId}`, response.status);
  }

  return response.json();
}

export async function postMeetingMessageApi(
  meetingId: string,
  body: { userId: string; userName: string; message: string },
): Promise<BackendChatMessageResponse> {
  const response = await fetch(`${MEETING_API_BASE_URL}/api/meetings/${meetingId}/messages`, {
    method: "POST",
    headers: jsonHeaders(body.userId, body.userName),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new MeetingApiError(`Failed to post message to meeting ${meetingId}`, response.status);
  }

  return response.json();
}
