import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { z } from "zod";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  LoaderCircle,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  type BackendMeetingResponse,
  listMeetingsFromApi,
} from "@/lib/api/meetings";
import type { AiInsight } from "@/types/ai-service";
import { useAiInsightStore } from "@/store/aiStore";
import { buildMeetingAiContext } from "@/lib/aiUtils";

const meetingSearchSchema = z.object({
  meetingId: z.string().optional(),
});

export const Route = createFileRoute("/summary")({
  validateSearch: meetingSearchSchema,
  component: SummaryPage,
  head: () => ({
    meta: [
      { title: "Post-Meeting Summary — MeetFlow" },
      {
        name: "description",
        content: "AI-generated meeting summary and action items",
      },
    ],
  }),
});

function SummaryPage() {
  const { meetingId } = Route.useSearch();
  const [meetings, setMeetings] = useState<BackendMeetingResponse[]>([]);
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true);
  const [meetingsError, setMeetingsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setIsLoadingMeetings(true);
    listMeetingsFromApi()
      .then((data) => {
        if (!cancelled) {
          setMeetings(data);
          setMeetingsError(null);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setMeetings([]);
          setMeetingsError(
            error instanceof Error ? error.message : "Could not load meetings",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingMeetings(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedMeeting = meetings.find((m) => m.id === meetingId);

  if (!selectedMeeting) {
    return (
      <MeetingSummarySelector
        meetings={meetings}
        isLoading={isLoadingMeetings}
        error={meetingsError}
      />
    );
  }

  return <MeetingSummaryDetail meeting={selectedMeeting} />;
}

function MeetingSummaryDetail({
  meeting,
}: {
  meeting: BackendMeetingResponse;
}) {
  const { report, reportLoading, reportError, fetchReport, reset } =
    useAiInsightStore();

  const context = useMemo(() => buildMeetingAiContext(meeting), [meeting]);

  // Fetch on mount; reset store on unmount so stale data doesn't bleed
  // into a different meeting if the user navigates away and back.
  useEffect(() => {
    fetchReport(context);
    return () => reset();
  }, [context, fetchReport, reset]);

  const actionInsights = report?.actionItems.insights.length
    ? report.actionItems.insights
    : (report?.full.insights ?? []);

  const riskInsights = report?.risks.insights.length
    ? report.risks.insights
    : (report?.full.insights ?? []);

  const uniqueParticipants = Array.from(
    new Map((meeting.participants ?? []).map((p) => [p.userId, p])).values(),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className='mx-auto max-w-6xl space-y-6'
    >
      {/* Header */}
      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
        <div className='space-y-3'>
          <Button asChild variant='outline' size='sm'>
            <Link to='/summary' search={{}}>
              <ArrowLeft className='h-3.5 w-3.5' />
              Back to meetings
            </Link>
          </Button>
          <div>
            <h1 className='text-3xl font-heading font-bold text-foreground'>
              {meeting.title} Summary
            </h1>
            <p className='mt-1 text-sm text-muted-foreground'>
              {formatDateTime(meeting.scheduledAt)} · {meeting.status} ·{" "}
              {uniqueParticipants.length} participants
            </p>
          </div>
        </div>

        <Button
          asChild
          className='bg-orange-500 text-slate-950 hover:bg-orange-400'
        >
          <Link to='/meeting/$id' params={{ id: meeting.id }}>
            Open live room
            <ArrowRight className='h-4 w-4' />
          </Link>
        </Button>
      </div>

      {/* Error banner */}
      {reportError && (
        <div className='flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200'>
          <AlertTriangle className='h-4 w-4 shrink-0' />
          AI service is unavailable, showing a local fallback shaped like the AI
          response: {reportError}
        </div>
      )}

      {/* Full intelligence card */}
      <div className='rounded-[2rem] border border-primary/20 gradient-surface p-6 glow-border'>
        <div className='mb-3 flex items-center gap-2'>
          {reportLoading ? (
            <LoaderCircle className='h-4 w-4 animate-spin text-primary' />
          ) : (
            <Sparkles className='h-4 w-4 text-primary' />
          )}
          <h3 className='font-heading text-lg font-semibold text-foreground'>
            AI Full Intelligence Report
          </h3>
          {report && (
            <span className='rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] text-primary'>
              {report.full.model}
            </span>
          )}
        </div>
        <p className='text-sm leading-relaxed text-muted-foreground'>
          {reportLoading
            ? "Generating insights from ai-service…"
            : (report?.full.summary ?? "No summary available.")}
        </p>
      </div>

      {/* Main grid */}
      <div className='grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]'>
        <div className='space-y-6'>
          <InsightPanel
            title='Action Items'
            icon={<CheckCircle2 className='h-4 w-4 text-muted-foreground' />}
            insights={actionInsights}
            isLoading={reportLoading}
            emptyText='The AI service did not return action items for this meeting.'
          />

          <InsightPanel
            title='Risk Radar'
            icon={<AlertTriangle className='h-4 w-4 text-muted-foreground' />}
            insights={riskInsights}
            isLoading={reportLoading}
            emptyText='The AI service did not return risk insights for this meeting.'
          />
        </div>

        <div className='space-y-6'>
          {/* Meeting snapshot */}
          <div className='rounded-[2rem] border border-border bg-card p-5'>
            <h3 className='mb-3 font-heading font-semibold text-foreground'>
              Meeting Snapshot
            </h3>
            <div className='space-y-3 text-sm text-muted-foreground'>
              <SnapshotRow label='Tween' value={meeting.tweenId.slice(0, 8)} />
              <SnapshotRow label='Status' value={meeting.status} />
              <SnapshotRow
                label='Max participants'
                value={String(meeting.maxParticipants ?? "Open")}
              />
              <SnapshotRow
                label='Stream room'
                value={meeting.streamCallType ?? "Not created"}
              />
            </div>
          </div>

          {/* Participants */}
          <div className='rounded-[2rem] border border-primary/15 bg-card p-5 shadow-[0_18px_50px_oklch(0.08_0.03_280/0.35)]'>
            <h3 className='mb-4 font-heading font-semibold text-foreground'>
              Participants
            </h3>
            <div className='space-y-3'>
              {uniqueParticipants.length ? (
                uniqueParticipants.map((participant, index) => (
                  <div
                    key={`${participant.userId}-${index}`}
                    className='flex items-center gap-3 rounded-xl border border-border/70 bg-muted/10 px-3 py-3'
                  >
                    <div className='flex h-10 w-10 items-center justify-center rounded-2xl gradient-accent text-sm font-bold text-primary-foreground'>
                      {initials(participant.displayName)}
                    </div>
                    <div>
                      <div className='font-medium text-foreground'>
                        {participant.displayName}
                      </div>
                      <div className='text-xs text-muted-foreground'>
                        {participant.role}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className='text-sm text-muted-foreground'>
                  No participants returned by meeting-service yet.
                </p>
              )}
            </div>
          </div>

          <InsightPanel
            title='Meeting Effectiveness'
            icon={<FileText className='h-4 w-4 text-muted-foreground' />}
            insights={report?.effectiveness.insights ?? []}
            isLoading={reportLoading}
            emptyText='The AI service did not return effectiveness insights for this meeting.'
          />
        </div>
      </div>
    </motion.div>
  );
}

function MeetingSummarySelector({
  meetings,
  isLoading,
  error,
}: {
  meetings: BackendMeetingResponse[];
  isLoading: boolean;
  error: string | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className='mx-auto max-w-6xl space-y-8'
    >
      <div className='rounded-[2.25rem] border border-primary/15 bg-card/70 p-6 shadow-[0_24px_80px_oklch(0.08_0.03_280/0.45)]'>
        <p className='mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary'>
          Summary Center
        </p>
        <h1 className='text-3xl font-heading font-bold text-foreground'>
          Select a meeting to inspect its AI summary
        </h1>
        <p className='mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground'>
          Meetings are loaded from meeting-service. The selected meeting is sent
          to ai-service for full intelligence, risks, action items, and meeting
          effectiveness.
        </p>
      </div>

      {isLoading && (
        <div className='flex items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground'>
          <LoaderCircle className='h-4 w-4 animate-spin' />
          Loading meetings from meeting-service...
        </div>
      )}

      {error && (
        <div className='flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>
          <AlertTriangle className='h-4 w-4 shrink-0' />
          {error}
        </div>
      )}

      {!isLoading && !error && meetings.length === 0 && (
        <div className='rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground'>
          No meetings returned by meeting-service yet. Create a meeting with
          `POST /api/meetings`, then refresh this page.
        </div>
      )}

      <div className='grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3'>
        {meetings.map((meeting, index) => (
          <motion.div
            key={meeting.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className='rounded-[2rem] border border-border bg-card p-5 shadow-[0_18px_50px_oklch(0.08_0.03_280/0.35)]'
          >
            <div className='mb-4 flex items-start justify-between gap-3'>
              <div>
                <div className='text-xs uppercase tracking-[0.24em] text-primary'>
                  Tween {meeting.tweenId.slice(0, 8)}
                </div>
                <h2 className='mt-2 text-xl font-heading font-semibold text-foreground'>
                  {meeting.title}
                </h2>
              </div>
              <div className='rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary'>
                {meeting.status}
              </div>
            </div>

            <p className='mb-4 text-sm leading-relaxed text-muted-foreground'>
              Scheduled {formatDateTime(meeting.scheduledAt)}. Select it to
              generate AI insights from ai-service.
            </p>

            <div className='mb-4 flex flex-wrap gap-2 text-xs text-muted-foreground'>
              <span className='rounded-full bg-muted/20 px-3 py-1'>
                {meeting.participants.length} people
              </span>
              <span className='rounded-full bg-muted/20 px-3 py-1'>
                {meeting.maxParticipants ?? "Open"} max
              </span>
              <span className='rounded-full bg-muted/20 px-3 py-1'>
                {meeting.streamCallType ?? "No stream"}
              </span>
            </div>

            <Button
              asChild
              className='w-full bg-orange-500 text-slate-950 hover:bg-orange-400'
            >
              <Link to='/summary' search={{ meetingId: meeting.id }}>
                Generate AI summary
                <ArrowRight className='h-4 w-4' />
              </Link>
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function InsightPanel({
  title,
  icon,
  insights,
  isLoading,
  emptyText,
}: {
  title: string;
  icon: ReactNode;
  insights: AiInsight[];
  isLoading: boolean;
  emptyText: string;
}) {
  return (
    <div className='rounded-2xl border border-border bg-card p-5'>
      <div className='mb-4 flex items-center gap-2'>
        {icon}
        <h3 className='font-heading font-semibold text-foreground'>{title}</h3>
      </div>

      {isLoading ? (
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <LoaderCircle className='h-3.5 w-3.5 animate-spin' />
          Loading insights…
        </div>
      ) : (
        <div className='space-y-2'>
          {insights.length ? (
            insights.map((insight, index) => (
              <motion.div
                key={`${insight.title}-${index}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className='rounded-xl border border-border/60 bg-muted/10 px-3 py-3'
              >
                <div className='mb-2 flex flex-wrap items-center gap-2'>
                  <span className='rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary'>
                    {insight.category}
                  </span>
                  <span className={severityClassName(insight.severity)}>
                    {insight.severity}
                  </span>
                  <span className='flex items-center gap-1 text-[10px] text-muted-foreground'>
                    <UserPlus className='h-3 w-3' />
                    AI generated
                  </span>
                </div>
                <div className='text-sm font-medium text-foreground'>
                  {insight.title}
                </div>
                <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>
                  {insight.detail}
                </p>
                {insight.recommendation && (
                  <p className='mt-2 text-xs leading-relaxed text-primary'>
                    {insight.recommendation}
                  </p>
                )}
              </motion.div>
            ))
          ) : (
            <p className='text-sm text-muted-foreground'>{emptyText}</p>
          )}
        </div>
      )}
    </div>
  );
}

function SnapshotRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-center justify-between rounded-xl bg-muted/20 px-3 py-2'>
      <span>{label}</span>
      <span className='font-medium text-foreground'>{value}</span>
    </div>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function severityClassName(severity: string) {
  const base = "rounded-md px-2 py-0.5 text-[10px] font-medium";
  if (severity === "HIGH") return `${base} bg-red-500/15 text-red-300`;
  if (severity === "MEDIUM") return `${base} bg-amber-500/15 text-amber-300`;
  if (severity === "LOW") return `${base} bg-emerald-500/15 text-emerald-300`;
  return `${base} bg-muted/30 text-muted-foreground`;
}
