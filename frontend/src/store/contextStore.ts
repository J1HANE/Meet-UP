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

  setMeetingId: (meetingId: string) => void;
  fetchMeetingSnapshot: (meetingId?: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  meetingId: null,

  groupSnapshot: [] as GroupSnapshot[],
  taskSnapshot: [] as TaskSnapshot[],
  meetingSnapshot: [] as MeetingSnapshot[],

  meetingLoading: false,
  meetingError: null,
} satisfies Partial<ContextState>;

function extractErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

export const useContextStore = create<ContextState>()((set, get) => ({
  ...initialState,

  setMeetingId: (meetingId) => set({ meetingId }),

  reset: () => set(initialState),

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
}));
