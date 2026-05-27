import { contextApi } from "@/lib/api/contextApi";
import {
  MeetingSnapshot,
  RelationshipSnapshot,
  TaskSnapshot,
} from "@/types/context-service";
import { create } from "zustand";

interface ContextState {
  meetingId: string | null;

  relationshipSnapshot: RelationshipSnapshot[];
  taskSnapshot: TaskSnapshot[];
  meetingSnapshot: MeetingSnapshot[];

  relationshipLoading: boolean;
  taskLoading: boolean;
  meetingLoading: boolean;

  relationshipError: string | null;
  taskError: string | null;
  meetingError: string | null;

  setMeetingId: (meetingId: string) => void;
  fetchRelationshipSnapshot: (meetingId?: string) => Promise<void>;
  fetchTaskSnapshot: (meetingId?: string) => Promise<void>;
  fetchMeetingSnapshot: (meetingId?: string) => Promise<void>;
  fetchAll: (meetingId?: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  meetingId: null,

  relationshipSnapshot: [] as RelationshipSnapshot[],
  taskSnapshot: [] as TaskSnapshot[],
  meetingSnapshot: [] as MeetingSnapshot[],

  relationshipLoading: false,
  taskLoading: false,
  meetingLoading: false,

  relationshipError: null,
  taskError: null,
  meetingError: null,
} satisfies Partial<ContextState>;

function extractErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export const useContextStore = create<ContextState>()((set, get) => ({
  ...initialState,

  setMeetingId: (meetingId) => set({ meetingId }),

  reset: () => set(initialState),

  fetchRelationshipSnapshot: async (meetingIdOverride) => {
    const meetingId = meetingIdOverride ?? get().meetingId;
    if (!meetingId) {
      set({ relationshipError: "No meetingId set. Call setMeetingId first." });
      return;
    }

    set({ relationshipLoading: true, relationshipError: null });
    try {
      const { data } = await contextApi.relationshipSnapshot(meetingId);
      set({ relationshipSnapshot: data, relationshipLoading: false });
    } catch (error) {
      set({
        relationshipLoading: false,
        relationshipError: extractErrorMessage(error),
      });
    }
  },

  fetchTaskSnapshot: async (meetingIdOverride) => {
    const meetingId = meetingIdOverride ?? get().meetingId;
    if (!meetingId) {
      set({ taskError: "No meetingId set. Call setMeetingId first." });
      return;
    }

    set({ taskLoading: true, taskError: null });
    try {
      const { data } = await contextApi.taskSnapshot(meetingId);
      set({ taskSnapshot: data, taskLoading: false });
    } catch (error) {
      set({
        taskLoading: false,
        taskError: extractErrorMessage(error),
      });
    }
  },

  fetchMeetingSnapshot: async (meetingIdOverride) => {
    const meetingId = meetingIdOverride ?? get().meetingId;
    if (!meetingId) {
      set({ meetingError: "No meetingId set. Call setMeetingId first." });
      return;
    }

    set({ meetingLoading: true, meetingError: null });
    try {
      const { data } = await contextApi.meetingSnapshot(meetingId);
      set({ meetingSnapshot: [data], meetingLoading: false });
    } catch (error) {
      set({
        meetingLoading: false,
        meetingError: extractErrorMessage(error),
      });
    }
  },

  fetchAll: async (meetingIdOverride) => {
    const meetingId = meetingIdOverride ?? get().meetingId;
    if (!meetingId) return;

    // Persist the id so individual fetches can reuse it
    set({ meetingId });

    await Promise.all([
      get().fetchRelationshipSnapshot(meetingId),
      get().fetchTaskSnapshot(meetingId),
      get().fetchMeetingSnapshot(meetingId),
    ]);
  },
}));
