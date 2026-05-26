import { AiMeetingContext } from "@/types/ai-service";

export function buildMeetingAiContext(meeting: {
  id: string;
  title: string;
  tweenId: string;
  createdBy: string;
  scheduledAt: string;
  status: string;
  participants: {
    userId: string;
    displayName: string;
    role: string;
    joinedAt: string;
  }[];
}): AiMeetingContext {
  // Deduplicate participants by userId
  const participants = Array.from(
    new Map(meeting.participants.map((p) => [p.userId, p])).values(),
  );

  return {
    meeting: {
      meetingId: meeting.id,
      title: meeting.title,
      startTime: meeting.scheduledAt,
      status: meeting.status,
      organizer: meeting.createdBy,
      attendeeIds: participants.map((p) => p.userId),
      notes: `Meeting "${meeting.title}" is currently ${meeting.status}. It has ${participants.length} participant(s) and belongs to tween ${meeting.tweenId}.`,
    },
    tasks: [],
    participants: participants.map((p) => ({
      userId: p.userId,
      name: p.displayName,
      role: p.role,
      joinedAt: p.joinedAt,
    })),
    groups: [
      {
        groupId: meeting.tweenId,
        name: `Tween ${meeting.tweenId.slice(0, 8)}`,
        members: participants.map((p) => p.userId),
        taskCount: 0,
      },
    ],
  };
}

export const sampleAiMeetingContexts: AiMeetingContext[] = [
  {
    meeting: {
      meetingId: "meeting-ai-001",
      title: "Sprint Planning - Week 21",
      description:
        "Plan backend delivery, unblock payment work, and rebalance ownership.",
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
      notes:
        "Discussing overdue tasks, payment service status, and assignment gaps.",
    },
    tasks: [
      {
        taskId: "task-payment-service",
        taskName: "Build payment service",
        taskDescription:
          "Implement payment provider integration and expose backend API.",
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
        taskDescription:
          "Validate meeting-service API responses and frontend mappings.",
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
      {
        userId: "user-1",
        name: "Alice Smith",
        role: "DEVELOPER",
        email: "alice@example.com",
      },
      {
        userId: "user-2",
        name: "Bob Johnson",
        role: "TECH_LEAD",
        email: "bob@example.com",
      },
      {
        userId: "reviewer-1",
        name: "Carol White",
        role: "QA_ENGINEER",
        email: "carol@example.com",
      },
    ],
    groups: [
      {
        groupId: "team-a",
        name: "Backend Team",
        members: ["user-1", "user-2"],
        taskCount: 5,
      },
    ],
  },
  {
    meeting: {
      meetingId: "meeting-ai-002",
      title: "Gateway Integration Review",
      description:
        "Review API gateway routing, local dev auth, and service access patterns.",
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
      notes:
        "Gateway is still being worked on; frontend needs stable local service access.",
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
      {
        userId: "user-2",
        name: "Bob Johnson",
        role: "TECH_LEAD",
        email: "bob@example.com",
      },
      {
        userId: "user-3",
        name: "Jihane Dev",
        role: "BACKEND_ENGINEER",
        email: "jihane@example.com",
      },
      {
        userId: "user-4",
        name: "Mina Frontend",
        role: "FRONTEND_ENGINEER",
        email: "mina@example.com",
      },
    ],
    groups: [
      {
        groupId: "team-platform",
        name: "Platform Team",
        members: ["user-2", "user-3", "user-4"],
        taskCount: 4,
      },
    ],
  },
];
