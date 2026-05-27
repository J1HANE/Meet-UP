import {
  MeetingSnapshot,
  RelationshipSnapshot,
  TaskSnapshot,
} from "@/types/context-service";
import axios from "axios";

const contextClient = axios.create({
  baseURL: "http://localhost:8087/api/context",
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

export const contextApi = {
  taskSnapshot: (meetingId: string) =>
    contextClient.get<TaskSnapshot[]>(`/${meetingId}/tasks`),

  relationshipSnapshot: (meetingId: string) =>
    contextClient.get<RelationshipSnapshot[]>(`/${meetingId}/relationships`),

  meetingSnapshot: (meetingId: string) =>
    contextClient.get<MeetingSnapshot>(`/${meetingId}/meetings`),
};
