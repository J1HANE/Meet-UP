import { BackendMeetingResponse } from "../meeting-service";

export type TaskSnapshot = Record<string, unknown>;
export type GroupSnapshot = Record<string, unknown>;

export interface TaskTimeline {
  assignedAt?: string | null;
  blockedAt?: string | null;
  cancelledAt?: string | null;
  completedAt?: string | null;
  createdAt?: string | null;
  deleteAt?: string | null;
  lastActivityAt?: string | null;
  startedAt?: string | null;
  submittedAt?: string | null;
  unblockedAt?: string | null;
}

export interface Tag {
  description?: string | null;
  name?: string | null;
  tagId?: string | null;
}

export interface SubTask {
  endDate?: string | null;
  parentTaskId?: string | null;
  priority?: string | null;
  progressPercent?: number | null;
  status?: string | null;
  taskId?: string | null;
  taskName?: string | null;
}

export interface BlockingDependency {
  blockingTaskId?: string | null;
  blockingTaskName?: string | null;
  blockingTaskStatus?: string | null;
  dependencyType?: string | null;
  reason?: string | null;
}

export interface MeetingSnapshot {
  generalMeetingDetails: BackendMeetingResponse;
  tasks: TaskSnapshot[];
  relationships: GroupSnapshot[];
}
