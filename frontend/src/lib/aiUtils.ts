import {
  AiInsight,
  AiMeetingContext,
  InsightResponse,
} from "@/types/ai-service";

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

export const sampleTaskInsightData: InsightResponse = {
  insightType: "TASK_ANALYSIS",
  summary:
    "The project team is facing a significant workload imbalance and several critical tasks are at risk of being delayed or missed due to a combination of factors.",
  insights: [
    {
      category: "WORKLOAD_IMBALANCE",
      severity: "HIGH",
      title:
        "Significant workload imbalance across teams – User-4 and User-3 are heavily burdened, while User-1 and User-5 have minimal assigned tasks.",
      detail:
        "User-4 has 80 hours of actual work completed, while User-3 is currently working on 33 hours. User-1 and User-5 have only 10 hours of work completed. This imbalance is creating bottlenecks and potentially impacting overall project delivery.",
      affectedEntities: ["user-4", "user-3", "user-1", "user-5"],
      recommendation:
        "Prioritize workload redistribution. Re-evaluate task assignments and potentially re-assign some tasks to alleviate pressure on User-4 and User-3. Consider temporary resource allocation to address the imbalance.",
    },
    {
      category: "OVERDUE_TASKS",
      severity: "HIGH",
      title:
        "5 tasks are overdue, impacting deadlines and potential project delays.",
      detail:
        "Five tasks are currently overdue – f20f93c9-96dd-4ca2-bf10-90eac3b30e69, 4ff6fcfd-70e6-47ab-93d4-64e3b92c96aa, 3d31c693-62f8-4bcd-8888-bbccddeeff00, a1b2c3d4-1111-4abc-9999-aabbccddeeff00, and b2c3d4e5-2222-4bcd-8888-bbccddeeff0011.",
      affectedEntities: [
        "f20f93c9-96dd-4ca2-bf10-90eac3b30e69",
        "4ff6fcfd-70e6-47ab-93d4-64e3b92c96aa",
        "3d31c693-62f8-4bcd-8888-bbccddeeff00",
        "a1b2c3d4-1111-4abc-9999-aabbccddeeff00",
        "b2c3d4e5-2222-4bcd-8888-bbccddeeff0011",
      ],
      recommendation:
        "Immediately initiate a task review and prioritization process to identify and address the root causes of these overdue tasks. Assign temporary resources to address critical tasks until the backlog is resolved.",
    },
    {
      category: "BLOCKED_TASKS",
      severity: "MEDIUM",
      title:
        "Task 'Database schema migration' is blocked – requires approval from the database team.",
      detail:
        "The Database schema migration task is blocked because the database team needs to approve the changes before proceeding. This is a critical task impacting data integrity and system stability.",
      affectedEntities: ["task-id: 3d31c693-62f8-47ab-93d4-64e3b92c96aa"],
      recommendation:
        "Escalate the blocked task to the database team and ensure they receive all necessary approvals before proceeding. Document the approval process for future reference.",
    },
    {
      category: "WORKLOAD_DISTRIBUTION",
      severity: "LOW",
      title:
        "User-1 is heavily overloaded, while User-5 has minimal assigned tasks.",
      detail:
        "User-1 has 80 hours of work completed, while User-5 has only 10 hours of work completed. This imbalance suggests a need for re-evaluation of task assignments and potential re-prioritization of work.",
      affectedEntities: ["user-1", "user-5"],
      recommendation:
        "Re-evaluate task assignments. Consider re-assigning some tasks to User-1 or User-5 to distribute the workload more evenly. Implement a task monitoring system to proactively identify potential bottlenecks.",
    },
    {
      category: "PRIORITY_MISMATCH",
      severity: "MEDIUM",
      title:
        "API rate limiting middleware – low priority compared to other tasks.",
      detail:
        "The API rate limiting middleware is currently assigned a low priority. It is crucial to ensure this task is properly prioritized to maintain system stability and prevent potential issues.",
      affectedEntities: ["task-id: a1b2c3d4-1111-4abc-9999-aabbccddeeff00"],
      recommendation:
        "Re-evaluate the priority of this task. Consider pushing it to the backburner or re-assigning it to a higher-priority task if necessary. Ensure the team understands the importance of this task.",
    },
    {
      category: "MISTAKES_AND_RISKS",
      severity: "LOW",
      title: "Potential risk of data loss during database schema migration.",
      detail:
        "The database schema migration task carries a risk of data loss if the migration process is not carefully executed. Proper testing and validation are crucial.",
      affectedEntities: ["task-id: 3d31c693-62f8-4bcd-8888-bbccddeeff00"],
      recommendation:
        "Implement a robust data validation and rollback mechanism for the database schema migration. Conduct thorough testing and validation before deploying the changes.",
    },
  ],
  model: "ollama",
  generatedAt: "2026-05-26T22:30:43.280228900Z",
};
