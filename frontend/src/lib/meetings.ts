export type MeetingParticipant = {
  name: string;
  initials: string;
  role: string;
  speaking?: boolean;
};

export type MeetingTranscriptLine = {
  speaker: string;
  text: string;
  time: string;
};

export type MeetingActionItem = {
  title: string;
  assignee: string;
  suggested: boolean;
};

export type MeetingTask = {
  title: string;
  done: boolean;
};

export type MeetingRecord = {
  id: string;
  title: string;
  time: string;
  dateLabel: string;
  duration: string;
  group: string;
  status: string;
  roomLabel: string;
  briefing: string;
  summary: string;
  participants: MeetingParticipant[];
  openTasks: MeetingTask[];
  decisions: string[];
  actionItems: MeetingActionItem[];
  transcriptLines: MeetingTranscriptLine[];
};

// Mock data removed - all meetings should come from the backend API
export const meetings: MeetingRecord[] = [];

export function getMeetingById(meetingId?: string) {
  return meetings.find((meeting) => meeting.id === meetingId);
}
