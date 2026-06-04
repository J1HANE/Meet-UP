import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Circle,
  Clock3,
  FileText,
  Layers3,
  Loader2,
  Users,
  AlertTriangle,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import {
  listMeetingsFromApi,
  getMeetingByIdFromApi,
  type BackendMeetingResponse,
} from "@/lib/api/meetings";

const meetingSearchSchema = z.object({
  meetingId: z.string().optional(),
});

export const Route = createFileRoute("/briefing")({
  validateSearch: meetingSearchSchema,
  component: BriefingRouter,
  head: () => ({
    meta: [
      { title: "Pre-Meeting Briefing — MeetFlow" },
      { name: "description", content: "AI-powered meeting preparation and task planning" },
    ],
  }),
});

function BriefingRouter() {
  const { meetingId } = Route.useSearch();

  if (meetingId) {
    return <BriefingDetail meetingId={meetingId} />;
  }

  return <MeetingPlanningSelector />;
}

/* ─────────────────────────────────────────────
   Detail view — selected meeting briefing
   ───────────────────────────────────────────── */
function BriefingDetail({ meetingId }: { meetingId: string }) {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email || "Meeting User";

  // Fetch the meeting from the backend
  const {
    data: meeting,
    isLoading: isMeetingLoading,
    isError: isMeetingError,
  } = useQuery({
    queryKey: ["meeting", meetingId],
    queryFn: () => getMeetingByIdFromApi(meetingId, user?.id, displayName),
    enabled: Boolean(meetingId),
  });

  // Fetch live context / briefing from context service
  const [liveContext, setLiveContext] = useState<any>(null);
  const [isLoadingContext, setIsLoadingContext] = useState(false);

  useEffect(() => {
    if (user && meetingId) {
      setIsLoadingContext(true);
      api
        .getBriefing(user, meetingId)
        .then((context) => {
          setLiveContext(context);
        })
        .catch((err) => {
          console.warn("Could not fetch live context from backend:", err);
          setLiveContext(null);
        })
        .finally(() => {
          setIsLoadingContext(false);
        });
    } else {
      setLiveContext(null);
    }
  }, [user, meetingId]);

  if (isMeetingLoading) {
    return (
      <div className="mx-auto max-w-5xl flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-3 text-sm text-muted-foreground">Loading meeting…</span>
      </div>
    );
  }

  if (isMeetingError || !meeting) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 py-12">
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          Meeting not found or failed to load.
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/briefing" search={{}}>
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to meetings
          </Link>
        </Button>
      </div>
    );
  }

  // Derive display values from backend + context
  const scheduledDate = new Date(meeting.scheduledAt);
  const dateLabel = scheduledDate.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeLabel = scheduledDate.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const displayBriefing =
    liveContext?.summary ||
    liveContext?.topics?.join(", ") ||
    "No briefing summary available yet. The AI-powered context will appear once the meeting session begins.";

  const displayDecisions = liveContext?.decisions?.length
    ? liveContext.decisions.map((d: any) => d.text)
    : ["No decisions recorded yet"];

  const displayTopics = liveContext?.topics?.length
    ? liveContext.topics
    : [];

  const displayStatus = liveContext?.status || meeting.status;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Button asChild variant="outline" size="sm">
            <Link to="/briefing" search={{}}>
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to meetings
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">{meeting.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pre-meeting briefing · {dateLabel} at {timeLabel}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-card/70 px-4 py-3 text-sm text-muted-foreground shadow-[0_16px_40px_oklch(0.08_0.03_280/0.35)]">
          <div className="font-medium text-foreground">
            {meeting.participants.length} participant{meeting.participants.length !== 1 ? "s" : ""}
          </div>
          <div>{displayStatus}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {/* Task Context / Summary */}
          <div className="rounded-[2rem] border border-primary/20 bg-card p-6 shadow-[0_24px_70px_oklch(0.08_0.03_280/0.45)]">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="font-heading text-lg font-semibold text-foreground">Task Context</h3>
              {isLoadingContext && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </div>
            <p className="leading-relaxed text-muted-foreground">{displayBriefing}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Decisions */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Layers3 className="w-4 h-4 text-primary" />
                <h3 className="font-heading text-sm font-semibold text-foreground">Focus Decisions</h3>
              </div>
              <div className="space-y-2">
                {displayDecisions.map((decision: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 w-4 h-4 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">{decision}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Snapshot */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-primary" />
                <h3 className="font-heading text-sm font-semibold text-foreground">Session Snapshot</h3>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between rounded-xl bg-muted/20 px-3 py-2">
                  <span>Scheduled</span>
                  <span className="font-medium text-foreground">{dateLabel}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/20 px-3 py-2">
                  <span>Time</span>
                  <span className="font-medium text-foreground">{timeLabel}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/20 px-3 py-2">
                  <span>Participants</span>
                  <span className="font-medium text-foreground">{meeting.participants.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/20 px-3 py-2">
                  <span>Status</span>
                  <span className="font-medium text-foreground">{displayStatus}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Topics */}
          {displayTopics.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="mb-3 font-heading text-sm font-semibold text-foreground">Topics</h3>
              <div className="space-y-2">
                {displayTopics.map((topic: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-secondary/25">
                    <Circle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Participants */}
          <div className="rounded-[2rem] border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="font-heading text-sm font-semibold text-foreground">Participants</h3>
            </div>
            <div className="space-y-3">
              {meeting.participants.length === 0 && (
                <p className="text-sm text-muted-foreground">No participants yet.</p>
              )}
              {meeting.participants.map((participant) => {
                const initials = participant.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div
                    key={participant.userId}
                    className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/10 px-3 py-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-accent text-sm font-bold text-primary-foreground">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground">{participant.displayName}</div>
                      <div className="text-xs text-muted-foreground">{participant.role}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-[2rem] border border-primary/20 gradient-surface p-5">
            <div className="mb-3 flex items-center gap-2 text-primary-foreground">
              <Clock3 className="w-4 h-4" />
              <h3 className="font-heading text-sm font-semibold">Ready to jump in?</h3>
            </div>
            <p className="mb-4 text-sm text-primary-foreground/80">
              Open the live room once you have reviewed the task context and participant list.
            </p>
            <Button asChild variant="secondary" className="w-full bg-orange-500 text-slate-950 hover:bg-orange-400">
              <Link to="/meeting/$id" params={{ id: meeting.id }}>
                Open meeting room
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Selector — list all meetings from backend
   ───────────────────────────────────────────── */
function MeetingPlanningSelector() {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email || "Meeting User";

  const {
    data: meetings = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["meetings", user?.id],
    queryFn: () => listMeetingsFromApi(user?.id, displayName),
    enabled: Boolean(user?.id),
  });

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-8">
      <div className="rounded-[2rem] border border-primary/15 bg-card/70 p-6 shadow-[0_24px_80px_oklch(0.08_0.03_280/0.45)]">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">Pre-Meeting</p>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Choose a meeting to open its task planning board
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Every meeting now starts with a task-first planning layer. Pick one of your meetings to review its
              context, task checklist, and participant readiness before the session begins.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-primary/20 gradient-surface p-4">
              <div className="text-2xl font-heading font-bold text-foreground">{meetings.length}</div>
              <div className="text-xs text-muted-foreground">Meetings ready for planning</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-2xl font-heading font-bold text-foreground">
                {meetings.reduce((sum, m) => sum + m.participants.length, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total participants</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-2xl font-heading font-bold text-foreground">
                {meetings.filter((m) => m.status === "SCHEDULED").length}
              </div>
              <div className="text-xs text-muted-foreground">Scheduled sessions</div>
            </div>
            <div className="rounded-2xl border border-primary/15 bg-card p-4">
              <div className="text-2xl font-heading font-bold text-foreground">
                {meetings.filter((m) => m.status === "LIVE" || m.status === "ACTIVE").length}
              </div>
              <div className="text-xs text-muted-foreground">Live rooms now</div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-3 text-sm text-muted-foreground">Loading your meetings…</span>
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {error instanceof Error ? error.message : "Failed to load meetings"}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && meetings.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            No meetings found. Create a meeting from the{" "}
            <Link to="/meeting" className="text-primary underline underline-offset-2 hover:text-primary/80">
              Meeting Room
            </Link>{" "}
            page first.
          </p>
        </div>
      )}

      {/* Meeting cards */}
      {!isLoading && !isError && meetings.length > 0 && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {meetings.map((meeting: BackendMeetingResponse, index: number) => {
            const scheduledDate = new Date(meeting.scheduledAt);
            const dateLabel = scheduledDate.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
            const timeLabel = scheduledDate.toLocaleTimeString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="group overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_18px_50px_oklch(0.08_0.03_280/0.35)]"
              >
                <div className="relative p-5">
                  <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.28),transparent_55%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_45%)]" />
                  <div className="relative space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.24em] text-primary">
                          {meeting.tweenId ? `Group` : "Meeting"}
                        </div>
                        <h2 className="mt-2 text-xl font-heading font-semibold text-foreground">{meeting.title}</h2>
                      </div>
                      <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
                        {meeting.status}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full bg-muted/20 px-3 py-1">{dateLabel}</span>
                      <span className="rounded-full bg-muted/20 px-3 py-1">{timeLabel}</span>
                      <span className="rounded-full bg-muted/20 px-3 py-1">
                        {meeting.participants.length} participant{meeting.participants.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {meeting.participants.slice(0, 5).map((participant) => {
                          const initials = participant.displayName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2);

                          return (
                            <div
                              key={participant.userId}
                              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-secondary text-[11px] font-bold text-secondary-foreground"
                            >
                              {initials}
                            </div>
                          );
                        })}
                        {meeting.participants.length > 5 && (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-muted text-[11px] font-bold text-muted-foreground">
                            +{meeting.participants.length - 5}
                          </div>
                        )}
                      </div>

                      <Button asChild className="bg-orange-500 text-slate-950 hover:bg-orange-400">
                        <Link to="/briefing" search={{ meetingId: meeting.id }}>
                          Open planning
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
