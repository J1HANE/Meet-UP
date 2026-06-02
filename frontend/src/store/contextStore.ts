import { contextApi } from "@/lib/api/contextApi";
import {
  MeetingSnapshot,
  GroupSnapshot,
  TaskSnapshot,
} from "@/types/context-service";
import { create } from "zustand";

interface ContextState {
  meetingId: string | null;

  groupSnapshot: GroupSnapshot[];
  taskSnapshot: TaskSnapshot[];
  meetingSnapshot: MeetingSnapshot[];

  meetingLoading: boolean;
  meetingError: string | null;
  lastFetchedAt: number | null;

  setMeetingId: (meetingId: string) => void;
  fetchMeetingSnapshot: (meetingId?: string) => Promise<void>;
  reset: () => void;
}

const STALE_THRESHOLD_MS = 60_000;

const initialState = {
  meetingId: null,

  groupSnapshot: [] as GroupSnapshot[],
  taskSnapshot: [] as TaskSnapshot[],
  meetingSnapshot: [] as MeetingSnapshot[],

  meetingLoading: false,
  meetingError: null,
  lastFetchedAt: null,
} satisfies Partial<ContextState>;

function extractErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export const useContextStore = create<ContextState>()((set, get) => ({
  ...initialState,

  setMeetingId: (meetingId) => {
    // Clear stale data when switching meetings
    if (meetingId !== get().meetingId) {
      set({ ...initialState, meetingId });
    }
  },

  reset: () => set(initialState),

  fetchMeetingSnapshot: async (meetingIdOverride, { force = false } = {}) => {
    const meetingId = meetingIdOverride ?? get().meetingId;
    if (!meetingId) {
      set({ meetingError: "No meetingId set. Call setMeetingId first." });
      return;
    }

    // Skip if already loading
    if (get().meetingLoading) return;

    // Skip if data is fresh enough and not forced
    const lastFetchedAt = get().lastFetchedAt;
    const isFresh =
      lastFetchedAt !== null &&
      Date.now() - lastFetchedAt < STALE_THRESHOLD_MS &&
      get().meetingId === meetingId;

    if (isFresh && !force) return;

    set({ meetingLoading: true, meetingError: null, meetingId });

    try {
      const { data } = await contextApi.meetingSnapshot(meetingId);
      set({
        meetingSnapshot: [data],
        meetingLoading: false,
        lastFetchedAt: Date.now(),
      });
    } catch (error) {
      set({
        meetingLoading: false,
        meetingError: extractErrorMessage(error),
      });
    }
  },
}));
