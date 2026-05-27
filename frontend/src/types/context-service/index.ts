export interface TaskSnapshot {
  actualHours?: number | null;
  ageInDays?: number | null;
  assignedTo?: string | null;
  assignedToType?: string | null;
  baselineEnd?: string | null;
  baselineStart?: string | null;
  blocked?: boolean | null;
  blockedByCount?: number | null;
  blockingCount?: number | null;
  blockingDependencies?: BlockingDependency[] | null;
  categoryId?: string | null;
  categoryName?: string | null;
  completedSubTasks?: number | null;
  createdBy?: string | null;
  endDate?: string | null;
  estimatedHours?: number | null;
  hoursVariance?: number | null;
  milestone?: boolean | null;
  overdue?: boolean | null;
  parentTaskId?: string | null;
  parentTaskName?: string | null;
  points?: number | null;
  priority?: string | null;
  progressPercent?: number | null;
  recurrenceInterval?: string | null;
  recurring?: boolean | null;
  requiresReview?: boolean | null;
  reviewedBy?: string | null;
  startDate?: string | null;
  status?: string | null;
  subTaskCompletionRate?: number | null;
  subTasks?: SubTask[] | null;
  tagCount?: number | null;
  tags?: Tag[] | null;
  taskDescription?: string | null;
  taskId?: string | null;
  taskName?: string | null;
  taskTimeline?: TaskTimeline | null;
  totalSubTasks?: number | null;
  varianceLabel?: string | null;
  visibility?: string | null;
}

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

export interface RelationshipSnapshot {
  something: string;
}

export interface MeetingSnapshot {
  something: string;
}
