import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { z } from "zod";
import { ArrowLeft, ArrowRight, CalendarClock, CheckCircle2, Circle, Clock3, FileText, Layers3, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMeetingById, meetings } from "@/lib/meetings";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

const meetingSearchSchema = z.object({
  meetingId: z.string().optional(),
});

export const Route = createFileRoute("/briefing")({
  validateSearch: meetingSearchSchema,
  component: BriefingPage,
  head: () => ({
    meta: [
      { title: "Pre-Meeting Briefing — MeetFlow" },
      { name: "description", content: "AI-powered meeting preparation and task planning" },
    ],
  }),
});

function BriefingPage() {
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
    return <MeetingPlanningSelector />;
  }

  // Merge live context details from backend if available, fallback to mock
  const displayBriefing = liveContext?.summary || liveContext?.topics?.join(", ") || meeting.briefing;
  const displayDecisions = liveContext?.decisions?.length 
    ? liveContext.decisions.map((d: any) => d.text) 
    : meeting.decisions;
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
              Task planning for {meeting.group} · {meeting.dateLabel} at {meeting.time}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-card/70 px-4 py-3 text-sm text-muted-foreground shadow-[0_16px_40px_oklch(0.08_0.03_280/0.35)]">
          <div className="font-medium text-foreground">{meeting.roomLabel}</div>
          <div>{displayStatus}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-primary/20 bg-card p-6 shadow-[0_24px_70px_oklch(0.08_0.03_280/0.45)]">
            <div className="mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="font-heading text-lg font-semibold text-foreground">Task Context</h3>
            </div>
            <p className="leading-relaxed text-muted-foreground">{displayBriefing}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Layers3 className="w-4 h-4 text-primary" />
                <h3 className="font-heading text-sm font-semibold text-foreground">Focus Decisions</h3>
              </div>
              <div className="space-y-2">
                {displayDecisions.map((decision: string) => (
                  <div key={decision} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 w-4 h-4 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">{decision}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-primary" />
                <h3 className="font-heading text-sm font-semibold text-foreground">Session Snapshot</h3>
              </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-between rounded-xl bg-muted/20 px-3 py-2">
                  <span>Duration</span>
                  <span className="font-medium text-foreground">{meeting.duration}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/20 px-3 py-2">
                  <span>Participants</span>
                  <span className="font-medium text-foreground">{meeting.participants.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted/20 px-3 py-2">
                  <span>Status</span>
                  <span className="font-medium text-foreground">{meeting.status}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="mb-3 font-heading text-sm font-semibold text-foreground">Task Checklist</h3>
            <div className="space-y-2">
              {meeting.openTasks.map((task) => (
                <div key={task.title} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-secondary/25">
                  {task.done ? (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={`text-sm ${task.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-border bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="font-heading text-sm font-semibold text-foreground">Participants</h3>
            </div>
            <div className="space-y-3">
              {meeting.participants.map((participant) => (
                <div key={participant.name} className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/10 px-3 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-accent text-sm font-bold text-primary-foreground">
                    {participant.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-foreground">{participant.name}</div>
                    <div className="text-xs text-muted-foreground">{participant.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-primary/20 gradient-surface p-5">
            <div className="mb-3 flex items-center gap-2 text-primary-foreground">
              <Clock3 className="w-4 h-4" />
              <h3 className="font-heading text-sm font-semibold">Ready to jump in?</h3>
            </div>
            <p className="mb-4 text-sm text-primary-foreground/80">
              Open the live room once you have reviewed the task context and selected the owners for the next actions.
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

function MeetingPlanningSelector() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-8">
      <div className="rounded-[2rem] border border-primary/15 bg-card/70 p-6 shadow-[0_24px_80px_oklch(0.08_0.03_280/0.45)]">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">Pre-Meeting</p>
            <h1 className="text-3xl font-heading font-bold text-foreground">Choose a meeting to open its task planning board</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Every meeting now starts with a task-first planning layer. Pick one of your meetings to review its context, task checklist, and participant readiness before the session begins.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-primary/20 gradient-surface p-4">
              <div className="text-2xl font-heading font-bold text-foreground">{meetings.length}</div>
              <div className="text-xs text-muted-foreground">Meetings ready for planning</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-2xl font-heading font-bold text-foreground">11</div>
              <div className="text-xs text-muted-foreground">Open tasks across sessions</div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-2xl font-heading font-bold text-foreground">3</div>
              <div className="text-xs text-muted-foreground">Live rooms this afternoon</div>
            </div>
            <div className="rounded-2xl border border-primary/15 bg-card p-4">
              <div className="text-2xl font-heading font-bold text-foreground">1</div>
              <div className="text-xs text-muted-foreground">Critical dependency to resolve</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {meetings.map((meeting, index) => (
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
                    <div className="text-xs uppercase tracking-[0.24em] text-primary">{meeting.group}</div>
                    <h2 className="mt-2 text-xl font-heading font-semibold text-foreground">{meeting.title}</h2>
                  </div>
                  <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
                    {meeting.status}
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground">{meeting.briefing}</p>

                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-muted/20 px-3 py-1">{meeting.dateLabel}</span>
                  <span className="rounded-full bg-muted/20 px-3 py-1">{meeting.time}</span>
                  <span className="rounded-full bg-muted/20 px-3 py-1">{meeting.participants.length} participants</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {meeting.participants.map((participant) => (
                      <div
                        key={participant.name}
                        className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-secondary text-[11px] font-bold text-secondary-foreground"
                      >
                        {participant.initials}
                      </div>
                    ))}
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
        ))}
      </div>
    </motion.div>
  );
}
