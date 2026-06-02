// hooks/useSelectedMeeting.ts
import { useMeetingStore } from "@/store/meetingStore";

export interface MeetingContext {
  contextId: string | null;
  meetingName: string | null;
  selectedMeeting: ReturnType<
    typeof useMeetingStore.getState
  >["selectedMeeting"];
  isReady: boolean;
}

export const useSelectedMeeting = (): MeetingContext => {
  const selectedMeeting = useMeetingStore((s) => s.selectedMeeting);

  return {
    selectedMeeting,
    contextId: selectedMeeting?.id ?? null,
    meetingName: selectedMeeting?.title ?? null,
    isReady: selectedMeeting !== null,
  };
};
