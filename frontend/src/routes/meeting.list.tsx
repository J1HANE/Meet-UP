import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Clock3, FileText, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { meetings } from "@/lib/meetings";

export const Route = createFileRoute("/meeting/list")({
  component: MeetingRoomSelector,
  head: () => ({
    meta: [
      { title: "Meeting Room — MeetFlow" },
      { name: "description", content: "Choose a meeting room to enter" },
    ],
  }),
});

function MeetingRoomSelector() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-8">
      <div className="relative overflow-hidden rounded-[2.25rem] border border-primary/15 bg-card/70 p-6 shadow-[0_28px_80px_oklch(0.08_0.03_280/0.45)]">
        <div className="absolute -left-20 top-10 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">Meeting Room</p>
            <h1 className="text-3xl font-heading font-bold text-foreground">Choose the live room you want to enter</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Pick a meeting and we will drop you into the active collaboration room with live transcript, participants, and task context.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl border border-border bg-card px-4 py-5">
              <div className="text-2xl font-heading font-bold text-foreground">{meetings.length}</div>
              <div className="text-xs text-muted-foreground">Rooms</div>
            </div>
            <div className="rounded-2xl border border-primary/20 gradient-surface px-4 py-5">
              <div className="text-2xl font-heading font-bold text-foreground">9</div>
              <div className="text-xs text-muted-foreground">Participants</div>
            </div>
            <div className="rounded-2xl border border-border bg-card px-4 py-5">
              <div className="text-2xl font-heading font-bold text-foreground">11</div>
              <div className="text-xs text-muted-foreground">Tasks live</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {meetings.map((meeting, index) => (
          <motion.div
            key={meeting.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07 }}
            whileHover={{ y: -4 }}
            className="group relative overflow-hidden rounded-[2rem] border border-border bg-card p-5 shadow-[0_18px_50px_oklch(0.08_0.03_280/0.35)]"
          >
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent" />
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-primary">{meeting.group}</div>
                <h2 className="mt-2 text-xl font-heading font-semibold text-foreground">{meeting.title}</h2>
              </div>
              <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
                {meeting.status}
              </div>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border/70 bg-muted/15 p-3">
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Room</div>
                <div className="mt-1 text-sm font-medium text-foreground">{meeting.roomLabel}</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-muted/15 p-3">
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Time</div>
                <div className="mt-1 text-sm font-medium text-foreground">{meeting.time}</div>
              </div>
            </div>

            <div className="mb-5 flex -space-x-2">
              {meeting.participants.map((participant) => (
                <div
                  key={participant.name}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-card bg-secondary text-xs font-bold text-secondary-foreground"
                >
                  {participant.initials}
                </div>
              ))}
            </div>

            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{meeting.summary}</p>

            <Button asChild className="w-full bg-orange-500 text-slate-950 hover:bg-orange-400">
              <Link to="/meeting/$id" params={{ id: meeting.id }}>
                Enter room
                <Video className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
