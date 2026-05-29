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

export async function askAiQuestion(
  context: AiMeetingContext,
  question: string,
): Promise<string> {
  const { data } = await aiInsightApi.ask(context, question);
  return data;
}

export function buildFallbackAnswer(
  context: AiMeetingContext,
  question: string,
): string {
  const names = (context.participants as Array<Record<string, unknown>>)
    .map((participant) => String(participant["name"] ?? participant["userId"] ?? "Unknown"))
    .join(", ");

  return [
    "Could not reach the AI service — here is a local answer from the available meeting data.",
    `Meeting: ${context.meeting.title}`,
    `Status: ${context.meeting.status ?? "Unknown"}`,
    `Participants: ${names || "none"}`,
    `Question: ${question}`,
    `Start ai-service on ${import.meta.env.VITE_AI_API_URL ?? "http://localhost:8087"} to get a generated answer.`,
  ].join("\n");
}
