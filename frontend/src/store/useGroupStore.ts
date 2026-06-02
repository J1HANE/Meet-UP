import { create } from "zustand";
import { api } from "../lib/api";

export interface Person {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Group {
  id: string;
  name: string;
  state: string;
  taskId: string;
  members: any[];
  leads: any[];
}

export interface Workload {
  personId: string;
  name: string;
  activeTaskCount: number;
}

interface GroupState {
  groups: Group[];
  activeGroup: Group | null;
  suggestions: Person[];
  workloads: Workload[];
  isLoading: boolean;
  error: string | null;

  fetchGroups: () => Promise<void>;
  fetchGroupDetails: (groupId: string) => Promise<void>;
  formGroup: (
    taskId: string,
    meetingId: string,
    ownerId: string,
  ) => Promise<void>;
  joinGroup: (groupId: string, personId: string, role: string) => Promise<void>;
  leaveGroup: (groupId: string, personId: string) => Promise<void>;
  fetchSuggestions: (taskId: string, creatorId: string) => Promise<void>;
  fetchWorkloads: () => Promise<void>;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  activeGroup: null,
  suggestions: [],
  workloads: [],
  isLoading: false,
  error: null,

  fetchGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/api/groups");
      set({ groups: response.data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message,
        isLoading: false,
      });
    }
  },

  fetchGroupDetails: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/groups/${groupId}`);
      set({ activeGroup: response.data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message,
        isLoading: false,
      });
    }
  },

  formGroup: async (taskId, meetingId, ownerId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/api/groups/form", null, {
        params: { taskId, meetingId, ownerId },
      });
      set((state) => ({
        groups: [...state.groups, response.data],
        activeGroup: response.data,
        isLoading: false,
      }));
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message,
        isLoading: false,
      });
    }
  },

  joinGroup: async (groupId, personId, role) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/api/groups/${groupId}/join`, null, {
        params: { personId, role },
      });
      await get().fetchGroupDetails(groupId);
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message,
        isLoading: false,
      });
    }
  },

  leaveGroup: async (groupId, personId) => {
    set({ isLoading: true, error: null });
    try {
      await api.post(`/api/groups/${groupId}/leave`, null, {
        params: { personId },
      });
      await get().fetchGroupDetails(groupId);
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message,
        isLoading: false,
      });
    }
  },

  fetchSuggestions: async (taskId, creatorId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/api/groups/suggestions", {
        params: { taskId, creatorId },
      });
      set({ suggestions: response.data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message,
        isLoading: false,
      });
    }
  },

  fetchWorkloads: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/api/groups/workload");
      set({ workloads: response.data, isLoading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || err.message,
        isLoading: false,
      });
    }
  },
}));
