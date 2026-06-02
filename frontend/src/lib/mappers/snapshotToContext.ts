// lib/mappers/snapshotToContext.ts
import { MeetingSnapshot } from "@/types/context-service";
import { AiMeetingContext, MeetingOnlyContext } from "@/types/ai-service";

export function snapshotToAiContext(
  snapshot: MeetingSnapshot,
): AiMeetingContext {
  const { generalMeetingDetails: m, tasks, groups } = snapshot;

  const meeting: MeetingOnlyContext = {
    meetingId: m.id ?? "",
    title: m.title ?? "",
    status: m.status ?? "",
    startTime: m.scheduledAt ?? "",
    organizer: m.createdBy ?? "",
    attendeeIds: m.participants.map((p) => p.userId) ?? [],
  };

  const participants: Record<string, unknown>[] = m.participants.map((p) => ({
    userId: p.userId,
    name: p.displayName,
    role: p.role,
    joinedAt: p.joinedAt,
  }));

  return {
    meeting,
    tasks: tasks as Record<string, unknown>[],
    participants,
    groups: groups as Record<string, unknown>[],
  };
}
