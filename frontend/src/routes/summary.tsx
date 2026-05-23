import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { z } from "zod";
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, Sparkles, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMeetingById, meetings } from "@/lib/meetings";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

const meetingSearchSchema = z.object({
  meetingId: z.string().optional(),
});

export const Route = createFileRoute("/summary")({
  validateSearch: meetingSearchSchema,
  component: SummaryPage,
  head: () => ({
    meta: [
      { title: "Post-Meeting Summary — MeetFlow" },
      { name: "description", content: "AI-generated meeting summary and action items" },
    ],
  }),
});

function SummaryPage() {
  const { meetingId } = Route.useSearch();
  const meeting = getMeetingById(meetingId);
  const { user } = useAuth();

  const [liveContext, setLiveContext] = useState<any>(null);
  const [isLoadingContext, setIsLoadingContext] = useState(false);

  useEffect(() => {
    if (user && meetingId) {
      setIsLoadingContext(true);
      api.getBriefing(user, meetingId)
        .then(context => {
          setLiveContext(context);
        })
        .catch(err => {
          console.warn("Could not fetch live context from backend, falling back to mock details:", err);
          setLiveContext(null);
        })
        .finally(() => {
          setIsLoadingContext(false);
        });
    } else {
      setLiveContext(null);
    }
  }, [user, meetingId]);

  if (!meeting) {
    return <MeetingSummarySelector />;
  }

  // Merge live context details from backend if available, fallback to mock
  const displaySummary = liveContext?.summary || meeting.summary;
  const displayDecisions = liveContext?.decisions?.length 
    ? liveContext.decisions.map((d: any) => d.text) 
    : meeting.decisions;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <Button asChild variant="outline" size="sm">
            <Link to="/summary" search={{}}>
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to meetings
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">{meeting.title} Summary</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {meeting.dateLabel} at {meeting.time} · Duration {meeting.duration}
            </p>
          </div>
        </div>

        <Button asChild className="bg-orange-500 text-slate-950 hover:bg-orange-400">
          <Link to="/meeting" search={{ meetingId: meeting.id }}>
            Open live room
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      <div className="rounded-[2rem] border border-primary/20 gradient-surface p-6 glow-border">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-heading text-lg font-semibold text-foreground">AI-Generated Summary</h3>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{displaySummary}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-4 font-heading font-semibold text-foreground">Action Items</h3>
            <div className="space-y-2">
              {meeting.actionItems.map((item, index) => (
                <motion.div
                  key={`${item.title}-${index}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 transition-all hover:bg-secondary/30"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 text-sm text-foreground">{item.title}</span>
                  <div className="flex items-center gap-2">
                    {item.suggested && (
                      <span className="flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                        <UserPlus className="w-3 h-3" />
                        AI suggested
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">{item.assignee}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-heading font-semibold text-foreground">Decision Log</h3>
            </div>
            <div className="space-y-2">
              {displayDecisions.map((decision: string) => (
                <div key={decision} className="flex items-start gap-2 py-1">
                  <div className="mt-1.5 shrink-0 neon-dot" />
                  <span className="text-sm text-muted-foreground">{decision}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-border bg-card p-5">
            <h3 className="mb-3 font-heading font-semibold text-foreground">Meeting Snapshot</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between rounded-xl bg-muted/20 px-3 py-2">
                <span>Team</span>
                <span className="font-medium text-foreground">{meeting.group}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/20 px-3 py-2">
                <span>Participants</span>
                <span className="font-medium text-foreground">{meeting.participants.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/20 px-3 py-2">
                <span>Room</span>
                <span className="font-medium text-foreground">{meeting.roomLabel}</span>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-primary/15 bg-card p-5 shadow-[0_18px_50px_oklch(0.08_0.03_280/0.35)]">
            <h3 className="mb-4 font-heading font-semibold text-foreground">Participants</h3>
            <div className="space-y-3">
              {meeting.participants.map((participant) => (
                <div key={participant.name} className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/10 px-3 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-accent text-sm font-bold text-primary-foreground">
                    {participant.initials}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{participant.name}</div>
                    <div className="text-xs text-muted-foreground">{participant.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MeetingSummarySelector() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-8">
      <div className="rounded-[2.25rem] border border-primary/15 bg-card/70 p-6 shadow-[0_24px_80px_oklch(0.08_0.03_280/0.45)]">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">Summary Center</p>
        <h1 className="text-3xl font-heading font-bold text-foreground">Select a meeting to inspect its summary</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Pick any session to review the generated summary, next actions, and participants involved. This gives the user a quick way to jump into the right debrief.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {meetings.map((meeting, index) => (
          <motion.div
            key={meeting.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="rounded-[2rem] border border-border bg-card p-5 shadow-[0_18px_50px_oklch(0.08_0.03_280/0.35)]"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-primary">{meeting.group}</div>
                <h2 className="mt-2 text-xl font-heading font-semibold text-foreground">{meeting.title}</h2>
              </div>
              <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
                {meeting.duration}
              </div>
            </div>

            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{meeting.summary}</p>

            <div className="mb-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted/20 px-3 py-1">{meeting.time}</span>
              <span className="rounded-full bg-muted/20 px-3 py-1">{meeting.participants.length} people</span>
              <span className="rounded-full bg-muted/20 px-3 py-1">{meeting.actionItems.length} actions</span>
            </div>

            <Button asChild className="w-full bg-orange-500 text-slate-950 hover:bg-orange-400">
              <Link to="/summary" search={{ meetingId: meeting.id }}>
                View summary
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
