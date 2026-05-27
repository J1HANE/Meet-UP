import { create } from "zustand";
import { AxiosError } from "axios";

import type {
  BackendMeetingResponse,
  BackendJoinMeetingResponse,
  BackendChatMessageResponse,
  CreateMeetingRequest,
} from "@/types/meeting-service";
import { meetingApi } from "@/lib/api/meetingApi";

interface MeetingState {
  // Lists
  meetings: BackendMeetingResponse[];
  meetingsLoading: boolean;
  meetingsError: string | null;

  // Selected meeting
  selectedMeeting: BackendMeetingResponse | null;
  selectedMeetingLoading: boolean;
  selectedMeetingError: string | null;

  // Join session (video + chat tokens)
  joinSession: BackendJoinMeetingResponse | null;
  joinLoading: boolean;
  joinError: string | null;

  // Chat messages for the selected meeting
  messages: BackendChatMessageResponse[];
  messagesLoading: boolean;
  messagesError: string | null;

  // Actions
  fetchMeetings: (userId?: string, userName?: string) => Promise<void>;
  fetchMeetingById: (
    meetingId: string,
    userId?: string,
    userName?: string,
  ) => Promise<void>;
  selectMeeting: (meeting: BackendMeetingResponse) => void;
  clearSelectedMeeting: () => void;
  createMeeting: (
    body: CreateMeetingRequest,
    userId?: string,
    userName?: string,
  ) => Promise<void>;
  joinMeeting: (
    meetingId: string,
    userId: string,
    userName: string,
  ) => Promise<void>;
  fetchMessages: (
    meetingId: string,
    userId?: string,
    userName?: string,
  ) => Promise<void>;
  postMessage: (
    meetingId: string,
    body: { userId: string; userName: string; message: string },
  ) => Promise<void>;
  reset: () => void;
}

const initialState = {
  meetings: [] as BackendMeetingResponse[],
  meetingsLoading: false,
  meetingsError: null,

  selectedMeeting: null,
  selectedMeetingLoading: false,
  selectedMeetingError: null,

  joinSession: null,
  joinLoading: false,
  joinError: null,

  messages: [] as BackendChatMessageResponse[],
  messagesLoading: false,
  messagesError: null,
} satisfies Partial<MeetingState>;

function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const serverMsg =
      (error.response?.data as { message?: string })?.message ?? null;
    return (
      serverMsg ??
      `Request failed: ${error.response?.status ?? "network error"}`
    );
  }
  return error instanceof Error ? error.message : "Unknown error";
}

export const useMeetingStore = create<MeetingState>()((set, get) => ({
  ...initialState,

  selectMeeting: (meeting) => set({ selectedMeeting: meeting }),

  clearSelectedMeeting: () =>
    set({ selectedMeeting: null, joinSession: null, messages: [] }),

  reset: () => set(initialState),

  fetchMeetings: async (userId, userName) => {
    set({ meetingsLoading: true, meetingsError: null });
    try {
      const { data } = await meetingApi.list(userId, userName);
      set({ meetings: data, meetingsLoading: false });
    } catch (error) {
      set({
        meetingsLoading: false,
        meetingsError: extractErrorMessage(error),
      });
    }
  },

  fetchMeetingById: async (meetingId, userId, userName) => {
    set({ selectedMeetingLoading: true, selectedMeetingError: null });
    try {
      const { data } = await meetingApi.getById(meetingId, userId, userName);
      set({ selectedMeeting: data, selectedMeetingLoading: false });
    } catch (error) {
      set({
        selectedMeetingLoading: false,
        selectedMeetingError: extractErrorMessage(error),
      });
    }
  },

  createMeeting: async (body, userId, userName) => {
    set({ meetingsLoading: true, meetingsError: null });
    try {
      const { data } = await meetingApi.create(body, userId, userName);
      set((state) => ({
        meetings: [data, ...state.meetings],
        selectedMeeting: data,
        meetingsLoading: false,
      }));
    } catch (error) {
      set({
        meetingsLoading: false,
        meetingsError: extractErrorMessage(error),
      });
    }
  },

  joinMeeting: async (meetingId, userId, userName) => {
    set({ joinLoading: true, joinError: null });
    try {
      const { data } = await meetingApi.join(meetingId, userId, userName);
      set({ joinSession: data, joinLoading: false });
    } catch (error) {
      set({ joinLoading: false, joinError: extractErrorMessage(error) });
    }
  },

  fetchMessages: async (meetingId, userId, userName) => {
    set({ messagesLoading: true, messagesError: null });
    try {
      const { data } = await meetingApi.listMessages(
        meetingId,
        userId,
        userName,
      );
      set({ messages: data, messagesLoading: false });
    } catch (error) {
      set({
        messagesLoading: false,
        messagesError: extractErrorMessage(error),
      });
    }
  },

  postMessage: async (meetingId, body) => {
    try {
      const { data } = await meetingApi.postMessage(meetingId, body);
      set((state) => ({ messages: [...state.messages, data] }));
    } catch (error) {
      set({ messagesError: extractErrorMessage(error) });
    }
  },
}));
