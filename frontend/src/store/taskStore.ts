// src/store/taskStore.ts
import { create } from "zustand";
import type {
  AssignedToType,
  Category,
  GanttData,
  RecurrenceInterval,
  Tag,
  Task,
  TaskDates,
  TaskHours,
  TaskStats,
  TaskStatus,
  TaskVisibility,
  TaskPriority,
  TaskDependencyResponseDto,
  TaskDependencyCreateDto,
  TaskDependencyUpdateDto,
} from "@/types/task-service";
import { taskApi, tagApi, categoryApi } from "@/lib/api/taskApi";

interface TaskStore {
  tasks: Task[];
  tags: Tag[];
  categories: Category[];
  selectedTask: Task | null;
  loading: boolean;
  error: string | null;
  ganttData: GanttData | null;
  taskStats: TaskStats[] | null;
  dependencies: TaskDependencyResponseDto[];
  dependenciesLoading: boolean;

  fetchTasks: (contextId: string) => Promise<void>;
  fetchTags: (contextId: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchGanttData: (contextId: string) => Promise<void>;
  fetchTaskStats: (contextId: string) => Promise<void>;

  createTask: (contextId: string, task: Partial<Task>) => Promise<void>;
  updateTask: (
    contextId: string,
    id: string,
    task: Partial<Task>,
  ) => Promise<void>;
  deleteTask: (contextId: string, id: string) => Promise<void>;
  updateTaskStatus: (
    contextId: string,
    id: string,
    status: TaskStatus,
  ) => Promise<void>;
  updateTaskPoints: (
    contextId: string,
    id: string,
    points: number,
  ) => Promise<void>;
  updateName: (contextId: string, id: string, name: string) => Promise<void>;
  assignTask: (
    contextId: string,
    id: string,
    assignedTo: string,
    assignedToType: AssignedToType,
  ) => Promise<void>;
  unassignTask: (contextId: string, id: string) => Promise<void>;
  updateTaskReviewer: (
    contextId: string,
    id: string,
    reviewedBy: string,
  ) => Promise<void>;
  setTaskMilestone: (
    contextId: string,
    id: string,
    isMilestone: boolean,
  ) => Promise<void>;
  toggleTaskMilestone: (contextId: string, id: string) => Promise<void>;
  updateTaskRecurrence: (
    contextId: string,
    id: string,
    interval?: RecurrenceInterval,
  ) => Promise<void>;
  updateTaskDates: (
    contextId: string,
    id: string,
    data: TaskDates,
  ) => Promise<void>;
  updateTaskHours: (
    contextId: string,
    id: string,
    data: TaskHours,
  ) => Promise<void>;
  updateTaskProgress: (
    contextId: string,
    id: string,
    progressPercent: number,
  ) => Promise<void>;
  updateTaskVisibility: (
    contextId: string,
    id: string,
    visibility: TaskVisibility,
  ) => Promise<void>;
  updateTaskPriority: (
    contextId: string,
    id: string,
    priority: TaskPriority,
  ) => Promise<void>;
  toggleTaskRequiresReview: (contextId: string, id: string) => Promise<void>;
  updateTaskCategory: (
    contextId: string,
    id: string,
    categoryId?: string,
  ) => Promise<void>;
  addTagToTask: (contextId: string, id: string, tagId: string) => Promise<void>;
  removeTaskTag: (
    contextId: string,
    id: string,
    tagId: string,
  ) => Promise<void>;

  //dependencies

  fetchDependencies: (contextId: string, taskId: string) => Promise<void>;
  createDependency: (
    contextId: string,
    taskId: string,
    data: TaskDependencyCreateDto,
  ) => Promise<void>;
  updateDependency: (
    contextId: string,
    taskId: string,
    dependencyId: string,
    data: TaskDependencyUpdateDto,
  ) => Promise<void>;
  deleteDependency: (
    contextId: string,
    taskId: string,
    dependencyId: string,
  ) => Promise<void>;

  setSelectedTask: (task: Task | null) => void;
  clearError: () => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  tags: [],
  categories: [],
  selectedTask: null,
  loading: false,
  error: null,
  ganttData: null,
  taskStats: null,
  dependencies: [],
  dependenciesLoading: false,

  fetchTasks: async (contextId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await taskApi.getAll(contextId);
      set({ tasks: response.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch tasks: " + error, loading: false });
    }
  },

  fetchTags: async (contextId: string) => {
    set({ error: null });
    try {
      const response = await tagApi.getAll(contextId);
      set({ tags: response.data });
    } catch (error) {
      set({ error: "Failed to fetch tags: " + error });
    }
  },

  fetchCategories: async () => {
    set({ error: null });
    try {
      const response = await categoryApi.getAll();
      set({ categories: response.data });
    } catch (error) {
      set({ error: "Failed to fetch categories: " + error });
    }
  },

  fetchGanttData: async (contextId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await taskApi.getGanttData(contextId);
      set({ ganttData: response.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch Gantt data: " + error, loading: false });
    }
  },

  fetchTaskStats: async (contextId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await taskApi.getStats(contextId);
      set({ taskStats: response.data, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch task stats: " + error, loading: false });
    }
  },

  createTask: async (contextId: string, task: Partial<Task>) => {
    set({ loading: true, error: null });
    try {
      const response = await taskApi.create(contextId, task);
      set((state) => ({
        tasks: [...state.tasks, response.data],
        loading: false,
      }));
    } catch (error) {
      const message = "Failed to create task: " + error;
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  addTagToTask: async (contextId: string, id: string, tagId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await taskApi.tagTask(contextId, id, tagId);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.taskId === id ? response.data : t)),
        selectedTask:
          state.selectedTask?.taskId === id
            ? response.data
            : state.selectedTask,
        loading: false,
      }));
    } catch (error) {
      set({ error: "Failed to add tag to task: " + error, loading: false });
    }
  },

  updateTask: async (contextId: string, id: string, task: Partial<Task>) => {
    set({ loading: true, error: null });
    try {
      const response = await taskApi.update(contextId, id, task);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.taskId === id ? response.data : t)),
        selectedTask:
          state.selectedTask?.taskId === id
            ? response.data
            : state.selectedTask,
        loading: false,
      }));
    } catch (error) {
      set({ error: "Failed to update task: " + error, loading: false });
    }
  },

  deleteTask: async (contextId: string, id: string) => {
    set({ loading: true, error: null });
    try {
      await taskApi.delete(contextId, id);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.taskId !== id),
        selectedTask:
          state.selectedTask?.taskId === id ? null : state.selectedTask,
        loading: false,
      }));
    } catch (error) {
      set({ error: "Failed to delete task: " + error, loading: false });
    }
  },

  updateTaskStatus: async (
    contextId: string,
    id: string,
    status: TaskStatus,
  ) => {
    set({ error: null });
    try {
      const response = await taskApi.updateStatus(contextId, id, status);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.taskId === id ? response.data : t)),
        selectedTask:
          state.selectedTask?.taskId === id
            ? response.data
            : state.selectedTask,
      }));
    } catch (error) {
      set({ error: "Failed to update task status: " + error });
    }
  },

  updateTaskPoints: async (contextId: string, id: string, points: number) => {
    set({ error: null });
    try {
      const response = await taskApi.updatePoints(contextId, id, points);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.taskId === id ? response.data : t)),
        selectedTask:
          state.selectedTask?.taskId === id
            ? response.data
            : state.selectedTask,
      }));
    } catch (error) {
      set({ error: "Failed to update task points: " + error });
    }
  },

  updateName: async (contextId: string, id: string, name: string) => {
    set({ error: null });
    try {
      const response = await taskApi.updateName(contextId, id, name);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.taskId === id ? response.data : t)),
        selectedTask:
          state.selectedTask?.taskId === id
            ? response.data
            : state.selectedTask,
      }));
    } catch (error) {
      set({ error: "Failed to update task name: " + error });
    }
  },

  assignTask: async (
    contextId: string,
    id: string,
    assignedTo: string,
    assignedToType: AssignedToType,
  ) => {
    set({ error: null });
    try {
      const response = await taskApi.assignTask(
        contextId,
        id,
        assignedTo,
        assignedToType,
      );
      set((state) => ({
        tasks: state.tasks.map((t) => (t.taskId === id ? response.data : t)),
        selectedTask:
          state.selectedTask?.taskId === id
            ? response.data
            : state.selectedTask,
      }));
    } catch (error) {
      set({ error: "Failed to assign task: " + error });
    }
  },

  unassignTask: async (contextId: string, id: string) => {
    set({ error: null });
    try {
      const response = await taskApi.unassignTask(contextId, id);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.taskId === id ? response.data : t)),
        selectedTask:
          state.selectedTask?.taskId === id
            ? response.data
            : state.selectedTask,
      }));
    } catch (error) {
      set({ error: "Failed to unassign task: " + error });
    }
  },

  updateTaskReviewer: async (
    contextId: string,
    id: string,
    reviewedBy: string,
  ) => {
    set({ error: null });
    try {
      const response = await taskApi.updateReviewer(contextId, id, reviewedBy);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.taskId === id ? response.data : t)),
        selectedTask:
          state.selectedTask?.taskId === id
            ? response.data
            : state.selectedTask,
      }));
    } catch (error) {
      set({ error: "Failed to update task reviewer: " + error });
    }
  },

  setTaskMilestone: async (
    contextId: string,
    id: string,
    isMilestone: boolean,
  ) => {
    set({ error: null });
    try {
      const response = await taskApi.setMilestone(contextId, id, isMilestone);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.taskId === id ? response.data : t)),
        selectedTask:
          state.selectedTask?.taskId === id
            ? response.data
            : state.selectedTask,
      }));
    } catch (error) {
      set({ error: "Failed to set task milestone: " + error });
    }
  },

  toggleTaskMilestone: async (contextId: string, id: string) => {
    set({ error: null });
    try {
      const response = await taskApi.toggleMilestone(contextId, id);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.taskId === id ? response.data : t)),
        selectedTask:
          state.selectedTask?.taskId === id
            ? response.data
            : state.selectedTask,
      }));
    } catch (error) {
      set({ error: "Failed to toggle task milestone: " + error });
    }
  },

  updateTaskRecurrence: async (
    contextId: string,
    id: string,
    interval?: RecurrenceInterval,
  ) => {
    set({ error: null });
    try {
      const response = await taskApi.updateRecurrence(contextId, id, interval);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.taskId === id ? response.data : t)),
        selectedTask:
          state.selectedTask?.taskId === id
            ? response.data
            : state.selectedTask,
      }));
    } catch (error) {
      set({ error: "Failed to update task recurrence: " + error });
    }
  },

  updateTaskDates: async (contextId: string, id: string, data: TaskDates) => {
    set({ error: null });
    try {
      const response = await taskApi.updateDates(contextId, id, data);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.taskId === id ? response.data : t)),
        selectedTask:
          state.selectedTask?.taskId === id
            ? response.data
            : state.selectedTask,
      }));
    } catch (error) {
      set({ error: "Failed to update task dates: " + error });
    }
  },

  updateTaskHours: async (contextId: string, id: string, data: TaskHours) => {
    set({ error: null });
    try {
      const response = await taskApi.updateHours(contextId, id, data);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.taskId === id ? response.data : t)),
        selectedTask:
          state.selectedTask?.taskId === id
            ? response.data
            : state.selectedTask,
      }));
    } catch (error) {
      set({ error: "Failed to update task hours: " + error });
    }
  },

  updateTaskProgress: async (
    contextId: string,
    id: string,
    progressPercent: number,
  ) => {
    set({ error: null });
    try {
      const response = await taskApi.updateProgress(
        contextId,
        id,
        progressPercent,
      );
      set((state) => ({
        tasks: state.tasks.map((t) => (t.taskId === id ? response.data : t)),
        selectedTask:
          state.selectedTask?.taskId === id
            ? response.data
            : state.selectedTask,
      }));
    } catch (error) {
      set({ error: "Failed to update task progress: " + error });
    }
  },

  updateTaskVisibility: async (
    contextId: string,
    id: string,
    visibility: TaskVisibility,
  ) => {
    set({ error: null });
    try {
      const response = await taskApi.updateVisibility(
        contextId,
        id,
        visibility,
      );
      set((state) => ({
        tasks: state.tasks.map((t) => (t.taskId === id ? response.data : t)),
        selectedTask:
          state.selectedTask?.taskId === id
            ? response.data
            : state.selectedTask,
      }));
    } catch (error) {
      set({ error: "Failed to update task visibility: " + error });
    }
  },

  updateTaskPriority: async (
    contextId: string,
    id: string,
    priority: TaskPriority,
  ) => {
    set({ error: null });
    try {
      const response = await taskApi.updatePriority(contextId, id, priority);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.taskId === id ? response.data : t)),
        selectedTask:
          state.selectedTask?.taskId === id
            ? response.data
            : state.selectedTask,
      }));
    } catch (error) {
      set({ error: "Failed to update task priority: " + error });
    }
  },

  toggleTaskRequiresReview: async (contextId: string, id: string) => {
    set({ error: null });
    try {
      const response = await taskApi.toggleRequiresReview(contextId, id);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.taskId === id ? response.data : t)),
        selectedTask:
          state.selectedTask?.taskId === id
            ? response.data
            : state.selectedTask,
      }));
    } catch (error) {
      set({ error: "Failed to toggle task requires review: " + error });
    }
  },

  updateTaskCategory: async (
    contextId: string,
    id: string,
    categoryId?: string,
  ) => {
    set({ error: null });
    try {
      const response = await taskApi.updateCategory(contextId, id, categoryId);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.taskId === id ? response.data : t)),
        selectedTask:
          state.selectedTask?.taskId === id
            ? response.data
            : state.selectedTask,
      }));
    } catch (error) {
      set({ error: "Failed to update task category: " + error });
    }
  },

  removeTaskTag: async (contextId: string, id: string, tagId: string) => {
    set({ error: null });
    try {
      const response = await taskApi.removeTag(contextId, id, tagId);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.taskId === id ? response.data : t)),
        selectedTask:
          state.selectedTask?.taskId === id
            ? response.data
            : state.selectedTask,
      }));
    } catch (error) {
      set({ error: "Failed to remove task tag: " + error });
    }
  },

  fetchDependencies: async (contextId, taskId) => {
    set({ dependenciesLoading: true, error: null });
    try {
      const response = await taskApi.getDependencies(contextId, taskId);
      set({ dependencies: response.data, dependenciesLoading: false });
    } catch (error) {
      set({
        error: "Failed to fetch dependencies: " + error,
        dependenciesLoading: false,
      });
    }
  },

  createDependency: async (contextId, taskId, data) => {
    set({ error: null });
    try {
      const response = await taskApi.createDependency(contextId, taskId, data);
      set((state) => ({
        dependencies: [...state.dependencies, response.data],
      }));
    } catch (error) {
      set({ error: "Failed to create dependency: " + error });
    }
  },

  updateDependency: async (contextId, taskId, dependencyId, data) => {
    set({ error: null });
    try {
      const response = await taskApi.updateDependency(
        contextId,
        taskId,
        dependencyId,
        data,
      );
      set((state) => ({
        dependencies: state.dependencies.map((d) =>
          d.dependsOnTaskId === response.data.dependsOnTaskId
            ? response.data
            : d,
        ),
      }));
    } catch (error) {
      set({ error: "Failed to update dependency: " + error });
    }
  },

  deleteDependency: async (contextId, taskId, dependencyId) => {
    set({ error: null });
    try {
      await taskApi.deleteDependency(contextId, taskId, dependencyId);
      set((state) => ({
        dependencies: state.dependencies.filter(
          (d) => d.dependsOnTaskId !== dependencyId,
        ),
      }));
    } catch (error) {
      set({ error: "Failed to delete dependency: " + error });
    }
  },

  setSelectedTask: (task: Task | null) => {
    set({ selectedTask: task });
  },

  clearError: () => {
    set({ error: null });
  },
}));
