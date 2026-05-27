import { aiInsightApi } from "@/lib/api/ai-insights";
import {
  AiInsight,
  AiMeetingContext,
  AiSummaryReport,
  InsightResponse,
  QaEntry,
} from "@/types/ai-service";
import { AxiosError } from "axios";
import { create } from "zustand";

interface AiInsightState {
  // Report
  report: AiSummaryReport | null;
  reportLoading: boolean;
  reportError: string | null;

  // Q&A
  qaHistory: QaEntry[];
  qaLoading: boolean;
  qaError: string | null;

  // Active meeting context (cached so Q&A can reuse it)
  activeContext: AiMeetingContext | null;

  // Actions
  fetchReport: (context: AiMeetingContext) => Promise<void>;
  askQuestion: (question: string, context?: AiMeetingContext) => Promise<void>;
  setActiveContext: (context: AiMeetingContext) => void;
  clearReport: () => void;
  clearQaHistory: () => void;
  reset: () => void;
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const serverMsg =
      (error.response?.data as { message?: string })?.message ?? null;
    return (
      serverMsg ??
      `Request failed: ${error.response?.status ?? "network error"}`
    );
  }
  return error instanceof Error ? error.message : "Unknown error";
}

function buildFallbackReport(context: AiMeetingContext): AiSummaryReport {
  const now = new Date().toISOString();
  const tasks = context.tasks as Array<Record<string, unknown>>;

  const overdue = tasks.filter((t) => t["overdue"] === true);
  const blocked = tasks.filter((t) => t["blocked"] === true);
  const unassigned = tasks.filter((t) => t["assignedTo"] == null);
  const highPriority = tasks.filter((t) => t["priority"] === "HIGH");

  const insights: AiInsight[] = [
    {
      category: "RISK",
      severity: overdue.length > 0 ? "HIGH" : "LOW",
      title: `${overdue.length} overdue task${overdue.length === 1 ? "" : "s"} need attention`,
      detail: overdue.length
        ? `Overdue: ${overdue.map((t) => String(t["taskName"] ?? t["taskId"])).join(", ")}.`
        : "No overdue tasks in this context.",
      affectedEntities: overdue.map((t) =>
        String(t["taskId"] ?? t["taskName"]),
      ),
      recommendation: overdue.length
        ? "Assign clear owners and review blockers before the next meeting."
        : "Keep the current cadence.",
    },
    {
      category: "BLOCKER",
      severity: blocked.length > 0 ? "MEDIUM" : "INFO",
      title: `${blocked.length} blocked task${blocked.length === 1 ? "" : "s"} detected`,
      detail: blocked.length
        ? `Blocked: ${blocked.map((t) => String(t["taskName"] ?? t["taskId"])).join(", ")}.`
        : "No blocked tasks in this context.",
      affectedEntities: blocked.map((t) =>
        String(t["taskId"] ?? t["taskName"]),
      ),
      recommendation: "Name dependency owners and next actions in the meeting.",
    },
    {
      category: "WORKLOAD",
      severity: unassigned.length > 0 ? "MEDIUM" : "INFO",
      title: `${unassigned.length} unassigned task${unassigned.length === 1 ? "" : "s"}`,
      detail: unassigned.length
        ? `Unassigned: ${unassigned.map((t) => String(t["taskName"] ?? t["taskId"])).join(", ")}.`
        : "Every task has an owner.",
      affectedEntities: unassigned.map((t) =>
        String(t["taskId"] ?? t["taskName"]),
      ),
      recommendation: "Confirm ownership before closing the meeting.",
    },
  ];

  const base: InsightResponse = {
    insightType: "FULL_INTELLIGENCE",
    summary: `${context.meeting.title} — ${tasks.length} tasks, ${highPriority.length} high-priority, ${overdue.length} overdue, ${blocked.length} blocked. (Offline fallback report.)`,
    insights,
    model: "frontend-fallback",
    generatedAt: now,
  };

  return {
    full: base,
    risks: {
      ...base,
      insightType: "RISK_RADAR",
      insights: insights.filter((i) => i.category !== "WORKLOAD"),
    },
    actionItems: { ...base, insightType: "ACTION_ITEMS" },
    effectiveness: { ...base, insightType: "MEETING_EFFECTIVENESS" },
  };
}

function buildFallbackAnswer(
  context: AiMeetingContext,
  question: string,
): string {
  const names = (context.participants as Array<Record<string, unknown>>)
    .map((p) => String(p["name"] ?? p["userId"] ?? "Unknown"))
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

const initialState = {
  report: null,
  reportLoading: false,
  reportError: null,
  qaHistory: [] as QaEntry[],
  qaLoading: false,
  qaError: null,
  activeContext: null,
} satisfies Partial<AiInsightState>;

export const useAiInsightStore = create<AiInsightState>()((set, get) => ({
  ...initialState,

  setActiveContext: (context) => set({ activeContext: context }),

  clearReport: () =>
    set({ report: null, reportError: null, reportLoading: false }),

  clearQaHistory: () => set({ qaHistory: [], qaError: null, qaLoading: false }),

  reset: () => set(initialState),

  fetchReport: async (context) => {
    set({ reportLoading: true, reportError: null, activeContext: context });

    try {
      const [full, risks, actionItems, effectiveness] = await Promise.all([
        aiInsightApi.full(context),
        aiInsightApi.riskRadar(context),
        aiInsightApi.actionItems(context),
        aiInsightApi.meetingEffectiveness(context),
      ]);

      set({
        report: {
          full: full.data,
          risks: risks.data,
          actionItems: actionItems.data,
          effectiveness: effectiveness.data,
        },
        reportLoading: false,
      });
    } catch (error) {
      set({
        report: buildFallbackReport(context),
        reportLoading: false,
        reportError: `AI service unavailable — showing offline report. (${extractErrorMessage(error)})`,
      });
    }
  },

  askQuestion: async (question, contextOverride) => {
    const context = contextOverride ?? get().activeContext;

    if (!context) {
      set({
        qaError:
          "No meeting context loaded. Call fetchReport first or pass a context.",
      });
      return;
    }

    set({ qaLoading: true, qaError: null });

    let answer: string;

    try {
      const { data } = await aiInsightApi.ask(context, question);
      answer = data;
    } catch (error) {
      answer = buildFallbackAnswer(context, question);
      set({
        qaError: `AI service unavailable — showing local answer. (${extractErrorMessage(error)})`,
      });
    }

    const entry: QaEntry = {
      id: crypto.randomUUID(),
      question,
      answer,
      askedAt: new Date().toISOString(),
    };

    set((state) => ({
      qaHistory: [...state.qaHistory, entry],
      qaLoading: false,
    }));
  },
}));
