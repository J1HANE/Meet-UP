import { MeetingSnapshot } from "@/types/context-service";
import { createApiClient } from "../axiosUtils";

const contextClient = createApiClient(
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8085/api/context",
  import.meta.env.VITE_AUTH_BASE_URL || "http://localhost:8085/api/auth",
);

export const contextApi = {
  meetingSnapshot: (meetingId: string) =>
    contextClient.get<MeetingSnapshot>(`/${meetingId}/snapshot`),
};
