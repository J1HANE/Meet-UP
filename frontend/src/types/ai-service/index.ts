export type InsightSeverity = "HIGH" | "MEDIUM" | "LOW" | "INFO" | string;

export interface AiInsight {
  category: string;
  severity: InsightSeverity;
  title: string;
  detail: string;
  affectedEntities: string[];
  recommendation: string;
}

export interface InsightResponse {
  insightType: string;
  summary: string;
  insights: AiInsight[];
  model: string;
  generatedAt: string;
}

export interface MeetingOnlyContext {
  meetingId: string;
  title: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
  organizer?: string;
  attendeeIds?: string[];
  agenda?: Record<string, unknown>[];
  actionItems?: Record<string, unknown>[];
  notes?: string;
  recordingUrl?: string;
}

export interface AiMeetingContext {
  meeting: MeetingOnlyContext;
  tasks: Record<string, unknown>[];
  participants: Record<string, unknown>[];
  groups: Record<string, unknown>[];
}

export interface AiSummaryReport {
  full: InsightResponse;
  risks: InsightResponse;
  actionItems: InsightResponse;
  effectiveness: InsightResponse;
}

export interface QaEntry {
  id: string;
  question: string;
  answer: string;
  askedAt: string;
}
