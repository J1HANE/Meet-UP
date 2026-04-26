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

export const meetings: MeetingRecord[] = [
  {
    id: "api-migration",
    title: "API Migration Task Planning",
    time: "10:00 AM",
    dateLabel: "Today",
    duration: "45 min",
    group: "Backend Team",
    status: "Live in 12 min",
    roomLabel: "Atlas Room",
    briefing:
      "Review the auth migration blockers, lock owners, and sequence deployment tasks for the v2 API rollout.",
    summary:
      "The team aligned on the API migration path, split ownership across auth, adapters, and deployment, and agreed to use feature flags for rollout safety.",
    participants: [
      { name: "John Doe", initials: "JD", role: "Product Engineer", speaking: true },
      { name: "Sarah Kim", initials: "SK", role: "Backend Lead" },
      { name: "Alex Johnson", initials: "AJ", role: "Platform Engineer" },
      { name: "Emma Chen", initials: "EC", role: "Frontend Engineer" },
    ],
    openTasks: [
      { title: "Finalize auth migration checklist", done: false },
      { title: "Update staging environment variables", done: true },
      { title: "Review API security notes", done: false },
      { title: "Prepare deployment fallback plan", done: false },
    ],
    decisions: [
      "Auth migration will ship behind a feature flag.",
      "Staging verification happens before docs are updated.",
      "Frontend adapter work starts as soon as two core endpoints are stable.",
    ],
    actionItems: [
      { title: "Complete API v2 auth migration", assignee: "Alex J.", suggested: true },
      { title: "Update frontend adapters for new endpoints", assignee: "Emma C.", suggested: true },
      { title: "Prepare staging deployment plan", assignee: "Sarah K.", suggested: true },
      { title: "Book security sign-off review", assignee: "John D.", suggested: false },
    ],
    transcriptLines: [
      { speaker: "John", text: "Let's start by locking the API migration owners for this week.", time: "10:01" },
      { speaker: "Sarah", text: "The v2 endpoints are mostly ready, but auth still needs a final pass.", time: "10:02" },
      { speaker: "Alex", text: "I can own the auth migration and pair with Sarah on rollout checks.", time: "10:03" },
      { speaker: "Emma", text: "Frontend adapters are queued and can move once the auth contract is stable.", time: "10:04" },
    ],
  },
  {
    id: "design-handoff",
    title: "Design Handoff Task Review",
    time: "2:00 PM",
    dateLabel: "Today",
    duration: "30 min",
    group: "Frontend Team",
    status: "Ready for prep",
    roomLabel: "Canvas Studio",
    briefing:
      "Validate the onboarding handoff tasks, confirm navigation decisions, and identify anything blocking implementation this week.",
    summary:
      "The team approved the onboarding flow, deferred one experimental variation, and split execution between UI implementation and content polish.",
    participants: [
      { name: "Emma Chen", initials: "EC", role: "Frontend Engineer", speaking: true },
      { name: "Alicia Reed", initials: "AR", role: "Product Designer" },
      { name: "John Doe", initials: "JD", role: "Product Engineer" },
    ],
    openTasks: [
      { title: "Confirm final empty-state copy", done: false },
      { title: "Review mobile navigation spacing", done: false },
      { title: "Map onboarding analytics events", done: true },
    ],
    decisions: [
      "Implementation starts with the simplified navigation structure.",
      "The secondary walkthrough step is postponed to the next release.",
      "Success metrics will be tracked from day one of rollout.",
    ],
    actionItems: [
      { title: "Build onboarding shell screens", assignee: "Emma C.", suggested: true },
      { title: "Finalize copy deck for onboarding", assignee: "Alicia R.", suggested: false },
      { title: "Instrument analytics events", assignee: "John D.", suggested: true },
    ],
    transcriptLines: [
      { speaker: "Emma", text: "We can ship the simplified onboarding structure this week.", time: "14:01" },
      { speaker: "Alicia", text: "The only unresolved item is the copy tone for the welcome state.", time: "14:02" },
      { speaker: "John", text: "Let's keep the first rollout small and measure completion before adding steps.", time: "14:03" },
    ],
  },
  {
    id: "client-onboarding",
    title: "Client Onboarding Task Sync",
    time: "4:30 PM",
    dateLabel: "Today",
    duration: "25 min",
    group: "Operations",
    status: "Starts later today",
    roomLabel: "Harbor Space",
    briefing:
      "Walk through the onboarding checklist, assign next actions, and ensure the support, docs, and engineering threads are lined up.",
    summary:
      "The onboarding sync clarified ownership, confirmed support coverage, and surfaced a documentation dependency before launch day.",
    participants: [
      { name: "Lina K.", initials: "LK", role: "Customer Success", speaking: true },
      { name: "Chris Moore", initials: "CM", role: "Support Lead" },
      { name: "John Doe", initials: "JD", role: "Product Engineer" },
    ],
    openTasks: [
      { title: "Finalize customer checklist handoff", done: false },
      { title: "Review support macros", done: true },
      { title: "Publish onboarding docs update", done: false },
    ],
    decisions: [
      "Support gets the final checklist 24 hours before kickoff.",
      "Documentation is treated as a release blocker.",
      "Escalation ownership stays with Customer Success for week one.",
    ],
    actionItems: [
      { title: "Publish onboarding checklist", assignee: "Lina K.", suggested: true },
      { title: "Refresh support macros", assignee: "Chris M.", suggested: false },
      { title: "Update docs screenshots", assignee: "John D.", suggested: true },
    ],
    transcriptLines: [
      { speaker: "Lina", text: "The onboarding checklist is nearly done, but docs still need the latest screenshots.", time: "16:31" },
      { speaker: "Chris", text: "Support macros are ready once the final product language is approved.", time: "16:32" },
      { speaker: "John", text: "I'll update the docs today so the rollout stays on schedule.", time: "16:33" },
    ],
  },
];

export function getMeetingById(meetingId?: string) {
  return meetings.find((meeting) => meeting.id === meetingId);
}
