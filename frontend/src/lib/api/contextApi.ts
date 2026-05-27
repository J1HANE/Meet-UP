import {
  MeetingSnapshot,
  GroupSnapshot,
  TaskSnapshot,
} from "@/types/context-service";
import axios from "axios";

const contextClient = axios.create({
  baseURL: "http://localhost:8087/api/context",
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

export const contextApi = {
  meetingSnapshot: (meetingId: string) =>
    contextClient.get<Record<string, unknown>>(`/${meetingId}/snapshot`),
};
