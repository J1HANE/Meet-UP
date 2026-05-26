import axios from "axios";
import type { AiMeetingContext, InsightResponse } from "@/types/ai-service";

const aiClient = axios.create({
  baseURL: import.meta.env.VITE_AI_API_URL ?? "http://localhost:8087",
  headers: { "Content-Type": "application/json" },
  timeout: 30_000,
});

export const aiInsightApi = {
  full: (context: AiMeetingContext) =>
    aiClient.post<InsightResponse>("/ai/insights/full", context),

  riskRadar: (context: AiMeetingContext) =>
    aiClient.post<InsightResponse>("/ai/insights/risk-radar", context),

  actionItems: (context: AiMeetingContext) =>
    aiClient.post<InsightResponse>("/ai/insights/action-items", context),

  meetingEffectiveness: (context: AiMeetingContext) =>
    aiClient.post<InsightResponse>(
      "/ai/insights/meeting-effectiveness",
      context,
    ),

  ask: (context: AiMeetingContext, question: string) =>
    aiClient.post<string>("/ai/insights/ask", context, {
      params: { question },
    }),
};
