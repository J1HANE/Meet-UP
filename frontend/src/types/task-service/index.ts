export interface Tag {
  tagId: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  taskCount?: number;
  createdAt?: string;
  createdBy?: string;
}

export interface Category {
  categoryId: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isActive: boolean;
  taskCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Task {
  taskId: string;
  contextId: string;
  parentTaskId?: string | null;
  subTaskCount: number;
  taskName: string;
  taskDescription?: string;
  startDate?: string;
  endDate?: string;
  baselineStart?: string;
  baselineEnd?: string;
  progressPercent: number;
  estimatedHours?: number;
  actualHours?: number | null;
  priority: TaskPriority;
  points: number;
  category?: Category;
  createdBy?: string | null;
  assignedTo?: string | null;
  assignedToType?: AssignedToType | null;
  reviewedBy?: string | null;
  status: TaskStatus;
  requiresReview: boolean;
  visibility: TaskVisibility;
  recurrenceInterval?: RecurrenceInterval | null;
  tags: Tag[];
  dependencyIds: string[];
  lastActivityAt?: string;
  createdAt?: string;
  assignedAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  isMilestone: boolean;
  isRecurring: boolean;
}

export type DependencyType =
  | "FINISH_TO_START"
  | "START_TO_START"
  | "FINISH_TO_FINISH"
  | "START_TO_FINISH";

export interface TaskDependency {
  fromTaskId: string;
  toTaskId: string;
  type: DependencyType;
  lagDays: number;
}

export type Participant = {
  id: string;
  name: string;
  assignedToType: AssignedToType;
};

export interface GanttTask {
  taskId: string;
  taskName: string;
  startDate: string;
  endDate: string;
  status: string;
  priority: string;
  progressPercent: number;
  parentTaskId?: string | null;
  dependsOnTaskIds: string[];
  assignedTo?: string | null;
  assignedToType?: string | null;
  categoryName?: string | null;
  categoryColor?: string | null;
  isMilestone: boolean;
  criticalPath: boolean;
  overdue: boolean;
  depth: number;
}

export interface GanttData {
  tasks: GanttTask[];
  dependencies: TaskDependency[];
  meta: {
    totalTasks: number;
    completedTasks: number;
    milestoneTasks: number;
    overallProgressPercent: number;
    overdueTasks: number;
    projectStart: string;
    projectEnd: string;
    today: string;
  };
}

export type TaskStatus =
  | "IN_BACKLOG"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "IN_REVIEW"
  | "COMPLETED"
  | "CANCELLED";

export type TaskPriority = "LOW" | "HIGH" | "NORMAL" | "URGENT";

export type TaskVisibility = "PUBLIC" | "PRIVATE" | "GROUP";

export type AssignedToType = "PERSON" | "GROUP" | "ALL";

export type RecurrenceInterval =
  | "DAILY"
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "QUARTERLY"
  | "YEARLY";

export interface TaskStats {
  taskId: string;
  progressPercent: number;
  totalSubTasks: number;
  completedSubTasks: number;
  subTaskCompletionRate: number | null;
  estimatedHours: number;
  actualHours: number;
  hoursVariance: number;
  blockedByCount: number;
  blockingCount: number;
  tagCount: number;
  ageInDays: number;
  isOverdue: boolean;
  createdAt: string;
  assignedAt: string;
  startedAt: string;
  completedAt: string;
}

export interface CategoryPatch {
  categoryId?: string;
}

export interface MilestonePatch {
  isMilestone: boolean;
}

export interface PointsPatch {
  points: number;
}

export interface PriorityPatch {
  priority: TaskPriority;
}

export interface ProgressPatch {
  progressPercent: number;
}

export interface RecurrencePatch {
  interval?: RecurrenceInterval;
}

export interface ReviewerPatch {
  reviewedBy: string;
}

export interface StatusPatch {
  status: TaskStatus;
}

export interface TagsPatch {
  tagIds: string[];
}

export interface VisibilityPatch {
  visibility: TaskVisibility;
}

export interface AssignPatch {
  assignedTo: string;
  assignedToType: AssignedToType;
}

export interface TaskDates {
  startDate: string | null;
  endDate: string | null;
  baselineStart: string | null;
  baselineEnd: string | null;
}

export interface TaskHours {
  estimatedHours: number;
  actualHours: number;
}

export interface TaskDependencyResponseDto {
  taskId: string;
  dependsOnTaskId: string;
  dependsOnTaskName: string;
  dependencyType: DependencyType;
  lagDays: number;
}

export interface TaskDependencyCreateDto {
  dependsOnTaskId: string;
  dependencyType: DependencyType;
  lagDays: number;
}

export interface TaskDependencyUpdateDto {
  dependencyType: DependencyType;
  lagDays: number;
}
