import axios from "axios";
import {
  BackendChatMessageResponse,
  BackendJoinMeetingResponse,
  BackendMeetingResponse,
  CreateMeetingRequest,
} from "@/types/meeting-service";
import { createApiClient } from "../axiosUtils";

const meetingClient = createApiClient(
  "http://localhost:8085",
  "http://localhost:8085/api/auth",
);

export const meetingApi = {
  list: (userId?: string, userName?: string) =>
    meetingClient.get<BackendMeetingResponse[]>("/api/meetings"),

  getById: (meetingId: string, userId?: string, userName?: string) =>
    meetingClient.get<BackendMeetingResponse>(`/api/meetings/${meetingId}`),

  create: (body: CreateMeetingRequest, userId?: string, userName?: string) =>
    meetingClient.post<BackendMeetingResponse>("/api/meetings", body),

  join: (meetingId: string, userId: string, userName: string) =>
    meetingClient.post<BackendJoinMeetingResponse>(
      `/api/meetings/${meetingId}/join`,
      { userId, userName: userName || `User ${userId.slice(0, 8)}` },
    ),

  listMessages: (meetingId: string, userId?: string, userName?: string) =>
    meetingClient.get<BackendChatMessageResponse[]>(
      `/api/meetings/${meetingId}/messages`,
    ),

  postMessage: (
    meetingId: string,
    body: { userId: string; userName: string; message: string },
  ) =>
    meetingClient.post<BackendChatMessageResponse>(
      `/api/meetings/${meetingId}/messages`,
      body,
    ),
};
