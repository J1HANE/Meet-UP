import type {
  AssignedToType,
  AssignPatch,
  Category,
  CategoryPatch,
  GanttData,
  MilestonePatch,
  PointsPatch,
  PriorityPatch,
  ProgressPatch,
  RecurrenceInterval,
  RecurrencePatch,
  ReviewerPatch,
  StatusPatch,
  Tag,
  Task,
  TaskDates,
  TaskHours,
  TaskStats,
  TaskStatus,
  TaskVisibility,
  VisibilityPatch,
  TaskPriority,
  TaskDependencyResponseDto,
  TaskDependencyCreateDto,
  TaskDependencyUpdateDto,
} from "@/types/task-service";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8091";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const taskApi = {
  getAll: (contextId: string) => api.get<Task[]>(`/context/${contextId}/tasks`),
  getById: (contextId: string, id: string) =>
    api.get<Task>(`/context/${contextId}/tasks/${id}`),
  create: (contextId: string, data: Partial<Task>) =>
    api.post<Task>(`/context/${contextId}/tasks`, data),
  update: (contextId: string, id: string, data: Partial<Task>) =>
    api.put<Task>(`/context/${contextId}/tasks/${id}`, data),
  delete: (contextId: string, id: string) =>
    api.delete(`/context/${contextId}/tasks/${id}`),
  // ── Patch operations ──────────────────────────────────────────────────────
  updateStatus: (contextId: string, id: string, status: TaskStatus) =>
    api.patch<Task>(`/context/${contextId}/tasks/${id}/status`, {
      status,
    } satisfies StatusPatch),

  updatePoints: (contextId: string, id: string, points: number) =>
    api.patch<Task>(`/context/${contextId}/tasks/${id}/points`, {
      points,
    } satisfies PointsPatch),

  updateName: (contextId: string, id: string, name: string) =>
    api.patch<Task>(`/context/${contextId}/tasks/${id}/name`, { name }),

  assignTask: (
    contextId: string,
    id: string,
    assignedTo: string,
    assignedToType: AssignedToType,
  ) =>
    api.patch<Task>(`/context/${contextId}/tasks/${id}/assign`, {
      assignedTo,
      assignedToType,
    } satisfies AssignPatch),

  unassignTask: (contextId: string, id: string) =>
    api.delete<Task>(`/context/${contextId}/tasks/${id}/assign`),

  updateReviewer: (contextId: string, id: string, reviewedBy: string) =>
    api.patch<Task>(`/context/${contextId}/tasks/${id}/reviewer`, {
      reviewedBy,
    } satisfies ReviewerPatch),

  setMilestone: (contextId: string, id: string, isMilestone: boolean) =>
    api.patch<Task>(`/context/${contextId}/tasks/${id}/milestone`, {
      isMilestone,
    } satisfies MilestonePatch),

  toggleMilestone: (contextId: string, id: string) =>
    api.patch<Task>(`/context/${contextId}/tasks/${id}/milestone/toggle`),

  updateRecurrence: (
    contextId: string,
    id: string,
    interval?: RecurrenceInterval,
  ) =>
    api.patch<Task>(`/context/${contextId}/tasks/${id}/recurrence`, {
      interval,
    } satisfies RecurrencePatch),

  updateDates: (contextId: string, id: string, data: TaskDates) =>
    api.patch<Task>(`/context/${contextId}/tasks/${id}/dates`, data),

  updateHours: (contextId: string, id: string, data: TaskHours) =>
    api.patch<Task>(`/context/${contextId}/tasks/${id}/hours`, data),

  updateProgress: (contextId: string, id: string, progressPercent: number) =>
    api.patch<Task>(`/context/${contextId}/tasks/${id}/progress`, {
      progressPercent,
    } satisfies ProgressPatch),

  updateVisibility: (
    contextId: string,
    id: string,
    visibility: TaskVisibility,
  ) =>
    api.patch<Task>(`/context/${contextId}/tasks/${id}/visibility`, {
      visibility,
    } satisfies VisibilityPatch),

  tagTask: (contextId: string, id: string, tagId: string) =>
    api.post<Task>(`/context/${contextId}/tasks/${id}/tags/${tagId}`),

  updatePriority: (contextId: string, id: string, priority: TaskPriority) =>
    api.patch<Task>(`/context/${contextId}/tasks/${id}/priority`, {
      priority,
    } satisfies PriorityPatch),

  toggleRequiresReview: (contextId: string, id: string) =>
    api.patch<Task>(`/context/${contextId}/tasks/${id}/requires-review/toggle`),

  updateCategory: (contextId: string, id: string, categoryId?: string) =>
    api.patch<Task>(`/context/${contextId}/tasks/${id}/category`, {
      categoryId,
    } satisfies CategoryPatch),

  removeTag: (contextId: string, id: string, tagId: string) =>
    api.delete<Task>(`/context/${contextId}/tasks/${id}/tags/${tagId}`),

  getGanttData: (contextId: string) =>
    api.get<GanttData>(`/context/${contextId}/tasks/gantt`),
  getStats: (contextId: string) =>
    api.get<TaskStats[]>(`/context/${contextId}/tasks/stats`),

  //dependecies
  getDependencies: (contextId: string, taskId: string) =>
    api.get<TaskDependencyResponseDto[]>(
      `/context/${contextId}/tasks/${taskId}/dependencies`,
    ),

  createDependency: (
    contextId: string,
    taskId: string,
    data: TaskDependencyCreateDto,
  ) =>
    api.post<TaskDependencyResponseDto>(
      `/context/${contextId}/tasks/${taskId}/dependencies`,
      data,
    ),

  updateDependency: (
    contextId: string,
    taskId: string,
    dependencyId: string,
    data: TaskDependencyUpdateDto,
  ) =>
    api.put<TaskDependencyResponseDto>(
      `/context/${contextId}/tasks/${taskId}/dependencies/${dependencyId}`,
      data,
    ),

  deleteDependency: (contextId: string, taskId: string, dependencyId: string) =>
    api.delete(
      `/context/${contextId}/tasks/${taskId}/dependencies/${dependencyId}`,
    ),
};

export const tagApi = {
  getAll: (contextId: string) => api.get<Tag[]>(`/context/${contextId}/tags`),
  getById: (contextId: string, id: string) =>
    api.get<Tag>(`/context/${contextId}/tags/${id}`),
  create: (contextId: string, data: Partial<Tag>) =>
    api.post<Tag>(`/context/${contextId}/tags/`, data),
  update: (contextId: string, id: string, data: Partial<Tag>) =>
    api.put<Tag>(`/context/${contextId}/tags/${id}`, data),
  delete: (contextId: string, id: string) =>
    api.delete(`/context/${contextId}/tags/${id}`),
};

export const categoryApi = {
  getAll: () => api.get<Category[]>("/categories"),
  getById: (id: string) => api.get<Category>(`/categories/${id}`),
  create: (data: Partial<Category>) => api.post<Category>("/categories", data),
  update: (id: string, data: Partial<Category>) =>
    api.put<Category>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

export default api;
