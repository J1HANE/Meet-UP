export type InsightSeverity = "HIGH" | "MEDIUM" | "LOW" | "INFO" | string;

export interface AiInsight {
  category: string;
  severity: InsightSeverity;
  title: string;
  detail: string;
  affectedEntities: string[];
  recommendation: string;
}

export interface InsightResponse {
  insightType: string;
  summary: string;
  insights: AiInsight[];
  model: string;
  generatedAt: string;
}

export interface AiMeetingContext {
  meeting: {
    meetingId: string;
    title: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    status?: string;
    organizer?: string;
    attendeeIds?: string[];
    agenda?: Record<string, unknown>[];
    actionItems?: Record<string, unknown>[];
    notes?: string;
    recordingUrl?: string;
  };
  tasks: Record<string, unknown>[];
  participants: Record<string, unknown>[];
  groups: Record<string, unknown>[];
}

export interface AiSummaryReport {
  full: InsightResponse;
  risks: InsightResponse;
  actionItems: InsightResponse;
  effectiveness: InsightResponse;
}

const AI_API_BASE_URL = import.meta.env.VITE_AI_API_URL || "http://localhost:8087";

async function postInsight(endpoint: string, context: AiMeetingContext): Promise<InsightResponse> {
  const response = await fetch(`${AI_API_BASE_URL}/ai/insights/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(context),
  });

  if (!response.ok) {
    throw new Error(`AI service ${endpoint} failed with ${response.status}`);
  }

  return response.json();
}

export async function getAiSummaryReport(context: AiMeetingContext): Promise<AiSummaryReport> {
  const [full, risks, actionItems, effectiveness] = await Promise.all([
    postInsight("full", context),
    postInsight("risk-radar", context),
    postInsight("action-items", context),
    postInsight("meeting-effectiveness", context),
  ]);

  return { full, risks, actionItems, effectiveness };
}

export async function askAiQuestion(context: AiMeetingContext, question: string): Promise<string> {
  const params = new URLSearchParams({ question });
  const response = await fetch(`${AI_API_BASE_URL}/ai/insights/ask?${params}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(context),
  });

  if (!response.ok) {
    throw new Error(`AI service ask failed with ${response.status}`);
  }

  return response.text();
}

export function buildMeetingAiContext(meeting: {
  id: string;
  title: string;
  tweenId: string;
  createdBy: string;
  scheduledAt: string;
  status: string;
  participants: { userId: string; displayName: string; role: string; joinedAt: string }[];
}): AiMeetingContext {
  const participants = Array.from(
    new Map(meeting.participants.map((participant) => [participant.userId, participant])).values(),
  );

  return {
    meeting: {
      meetingId: meeting.id,
      title: meeting.title,
      startTime: meeting.scheduledAt,
      status: meeting.status,
      organizer: meeting.createdBy,
      attendeeIds: participants.map((participant) => participant.userId),
      notes: `Meeting ${meeting.title} is currently ${meeting.status}. It has ${participants.length} participants and belongs to tween ${meeting.tweenId}.`,
    },
    tasks: [],
    participants: participants.map((participant) => ({
      userId: participant.userId,
      name: participant.displayName,
      role: participant.role,
      joinedAt: participant.joinedAt,
    })),
    groups: [
      {
        groupId: meeting.tweenId,
        name: `Tween ${meeting.tweenId.slice(0, 8)}`,
        members: participants.map((participant) => participant.userId),
        taskCount: 0,
      },
    ],
  };
}

export function buildFallbackAnswer(context: AiMeetingContext, question: string) {
  const participantNames = context.participants
    .map((participant) => String(participant.name ?? participant.userId ?? "Unknown"))
    .join(", ");

  return [
    `I could not reach the AI service, so here is a local answer from the meeting data I have.`,
    `Meeting: ${context.meeting.title}`,
    `Status: ${context.meeting.status ?? "Unknown"}`,
    `Participants: ${participantNames || "none returned by meeting-service"}`,
    `Question: ${question}`,
    `Start ai-service on ${AI_API_BASE_URL} to get a generated answer from /ai/insights/ask.`,
  ].join("\n");
}

export const sampleAiMeetingContexts: AiMeetingContext[] = [
  {
    meeting: {
      meetingId: "meeting-ai-001",
      title: "Sprint Planning - Week 21",
      description: "Plan backend delivery, unblock payment work, and rebalance ownership.",
      startTime: "2026-05-24T09:00:00Z",
      endTime: "2026-05-24T10:00:00Z",
      status: "IN_PROGRESS",
      organizer: "user-2",
      attendeeIds: ["user-1", "user-2", "reviewer-1"],
      agenda: [
        { item: "Review overdue tasks", duration: "15 min" },
        { item: "Payment service status", duration: "20 min" },
        { item: "Sprint goals", duration: "10 min" },
      ],
      notes: "Discussing overdue tasks, payment service status, and assignment gaps.",
    },
    tasks: [
      {
        taskId: "task-payment-service",
        taskName: "Build payment service",
        taskDescription: "Implement payment provider integration and expose backend API.",
        priority: "HIGH",
        status: "IN_BACKLOG",
        overdue: true,
        blocked: false,
        blockingCount: 2,
        progressPercent: 0,
        estimatedHours: 24.5,
        ageInDays: 19,
        assignedTo: null,
      },
      {
        taskId: "task-auth-refresh",
        taskName: "Implement refresh-token flow",
        taskDescription: "Finish JWT refresh behavior and token persistence.",
        priority: "LOW",
        status: "IN_BACKLOG",
        overdue: true,
        blocked: false,
        blockingCount: 0,
        progressPercent: 0,
        estimatedHours: 24.5,
        ageInDays: 19,
        assignedTo: null,
      },
      {
        taskId: "task-review-api",
        taskName: "Review meeting API",
        taskDescription: "Validate meeting-service API responses and frontend mappings.",
        priority: "HIGH",
        status: "COMPLETED",
        overdue: false,
        blocked: true,
        progressPercent: 23,
        estimatedHours: 25,
        actualHours: 25,
        ageInDays: 19,
        assignedTo: "user-1",
      },
    ],
    participants: [
      { userId: "user-1", name: "Alice Smith", role: "DEVELOPER", email: "alice@example.com" },
      { userId: "user-2", name: "Bob Johnson", role: "TECH_LEAD", email: "bob@example.com" },
      { userId: "reviewer-1", name: "Carol White", role: "QA_ENGINEER", email: "carol@example.com" },
    ],
    groups: [
      { groupId: "team-a", name: "Backend Team", members: ["user-1", "user-2"], taskCount: 5 },
    ],
  },
  {
    meeting: {
      meetingId: "meeting-ai-002",
      title: "Gateway Integration Review",
      description: "Review API gateway routing, local dev auth, and service access patterns.",
      startTime: "2026-05-24T13:00:00Z",
      endTime: "2026-05-24T13:45:00Z",
      status: "SCHEDULED",
      organizer: "user-3",
      attendeeIds: ["user-2", "user-3", "user-4"],
      agenda: [
        { item: "Gateway route ownership", duration: "10 min" },
        { item: "JWT bypass for frontend development", duration: "15 min" },
        { item: "Service-by-service smoke tests", duration: "20 min" },
      ],
      notes: "Gateway is still being worked on, so frontend needs stable local service access.",
    },
    tasks: [
      {
        taskId: "task-gateway-meetings",
        taskName: "Add meeting-service gateway route",
        priority: "HIGH",
        status: "IN_PROGRESS",
        overdue: false,
        blocked: false,
        blockingCount: 1,
        progressPercent: 70,
        estimatedHours: 6,
        assignedTo: "user-3",
      },
      {
        taskId: "task-dev-auth",
        taskName: "Add frontend dev-auth switch",
        priority: "HIGH",
        status: "COMPLETED",
        overdue: false,
        blocked: false,
        blockingCount: 0,
        progressPercent: 100,
        estimatedHours: 3,
        assignedTo: "user-2",
      },
    ],
    participants: [
      { userId: "user-2", name: "Bob Johnson", role: "TECH_LEAD", email: "bob@example.com" },
      { userId: "user-3", name: "Jihane Dev", role: "BACKEND_ENGINEER", email: "jihane@example.com" },
      { userId: "user-4", name: "Mina Frontend", role: "FRONTEND_ENGINEER", email: "mina@example.com" },
    ],
    groups: [
      { groupId: "team-platform", name: "Platform Team", members: ["user-2", "user-3", "user-4"], taskCount: 4 },
    ],
  },
];

export function buildFallbackReport(context: AiMeetingContext): AiSummaryReport {
  const now = new Date().toISOString();
  const overdue = context.tasks.filter((task) => task.overdue === true);
  const blocked = context.tasks.filter((task) => task.blocked === true);
  const unassigned = context.tasks.filter((task) => task.assignedTo == null);
  const highPriority = context.tasks.filter((task) => task.priority === "HIGH");

  const insights: AiInsight[] = [
    {
      category: "RISK",
      severity: overdue.length > 0 ? "HIGH" : "LOW",
      title: `${overdue.length} overdue task${overdue.length === 1 ? "" : "s"} need attention`,
      detail: overdue.length
        ? `Overdue work includes ${overdue.map((task) => String(task.taskName ?? task.taskId)).join(", ")}.`
        : "No overdue tasks are present in this context.",
      affectedEntities: overdue.map((task) => String(task.taskId ?? task.taskName)),
      recommendation: overdue.length ? "Assign clear owners and review blockers before the next meeting." : "Keep the current cadence.",
    },
    {
      category: "BLOCKER",
      severity: blocked.length > 0 ? "MEDIUM" : "INFO",
      title: `${blocked.length} blocked task${blocked.length === 1 ? "" : "s"} detected`,
      detail: blocked.length
        ? `Blocked work includes ${blocked.map((task) => String(task.taskName ?? task.taskId)).join(", ")}.`
        : "No blocked tasks are present in this context.",
      affectedEntities: blocked.map((task) => String(task.taskId ?? task.taskName)),
      recommendation: "Use the meeting to name dependency owners and next actions.",
    },
    {
      category: "WORKLOAD",
      severity: unassigned.length > 0 ? "MEDIUM" : "INFO",
      title: `${unassigned.length} unassigned task${unassigned.length === 1 ? "" : "s"}`,
      detail: unassigned.length
        ? `Unassigned work includes ${unassigned.map((task) => String(task.taskName ?? task.taskId)).join(", ")}.`
        : "Every task in this context has an owner.",
      affectedEntities: unassigned.map((task) => String(task.taskId ?? task.taskName)),
      recommendation: "Confirm ownership before closing the meeting.",
    },
  ];

  const full: InsightResponse = {
    insightType: "FULL_INTELLIGENCE",
    summary: `${context.meeting.title} has ${context.tasks.length} tasks, ${highPriority.length} high-priority items, ${overdue.length} overdue items, and ${blocked.length} blocked items. This is a local fallback report shaped like the AI service response, used when the AI backend is not available.`,
    insights,
    model: "frontend-fallback",
    generatedAt: now,
  };

  return {
    full,
    risks: { ...full, insightType: "RISK_RADAR", insights: insights.filter((insight) => insight.category !== "WORKLOAD") },
    actionItems: { ...full, insightType: "ACTION_ITEMS", insights },
    effectiveness: { ...full, insightType: "MEETING_EFFECTIVENESS", insights },
  };
}
