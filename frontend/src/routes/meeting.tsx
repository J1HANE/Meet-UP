import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { z } from "zod";
import { ArrowLeft, Clock3, FileText, MessageSquare, Mic, MicOff, MonitorUp, PhoneOff, Users, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMeetingById, meetings } from "@/lib/meetings";
import { useState } from "react";

const meetingSearchSchema = z.object({
  meetingId: z.string().optional(),
});

export const Route = createFileRoute("/meeting")({
  validateSearch: meetingSearchSchema,
  component: MeetingRoomPage,
  head: () => ({
    meta: [
      { title: "Meeting Room — MeetFlow" },
      { name: "description", content: "Live meeting session with real-time collaboration" },
    ],
  }),
});

function MeetingRoomPage() {
  const { meetingId } = Route.useSearch();
  const meeting = getMeetingById(meetingId);

  if (!meeting) {
    return <MeetingRoomSelector />;
  }

  return <MeetingRoom meetingId={meeting.id} />;
}

function MeetingRoom({ meetingId }: { meetingId: string }) {
  const meeting = getMeetingById(meetingId);
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "transcript">("transcript");

  if (!meeting) {
    return <MeetingRoomSelector />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-3">
          <Button asChild variant="outline" size="sm">
            <Link to="/meeting" search={{}}>
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to meetings
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">{meeting.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {meeting.group} · {meeting.roomLabel} · {meeting.time}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-medium text-primary">
            {meeting.status}
          </div>
          <Button asChild className="bg-orange-500 text-slate-950 hover:bg-orange-400">
            <Link to="/summary" search={{ meetingId: meeting.id }}>
              Open summary
              <FileText className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-10rem)] gap-4">
        <div className="hidden w-64 shrink-0 space-y-4 xl:block">
          <div className="rounded-[2rem] border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="font-heading text-sm font-semibold text-foreground">Participants</h3>
            </div>
            <div className="space-y-3">
              {meeting.participants.map((participant) => (
                <div key={participant.name} className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/10 px-3 py-3">
                  <div className="relative">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                      {participant.initials}
                    </div>
                    {participant.speaking && (
                      <div className="absolute -bottom-0.5 -right-0.5 live-dot" style={{ width: 6, height: 6 }} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-foreground">{participant.name}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{participant.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Clock3 className="w-4 h-4 text-primary" />
              <h3 className="font-heading text-sm font-semibold text-foreground">Live Task Pulse</h3>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              {meeting.openTasks.map((task) => (
                <div key={task.title} className="rounded-xl bg-muted/20 px-3 py-2">
                  {task.title}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-4 grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
            {meeting.participants.map((participant) => (
              <div
                key={participant.name}
                className={`relative flex items-center justify-center rounded-[2rem] border bg-muted/30 ${
                  participant.speaking ? "border-primary/50 glow-border" : "border-border"
                }`}
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-surface text-2xl font-heading font-bold text-foreground">
                  {participant.initials}
                </div>
                <div className="glass-panel absolute bottom-4 left-4 rounded-xl px-3 py-1.5 text-xs text-foreground">
                  {participant.name}
                  {participant.speaking && (
                    <span
                      className="live-dot ml-2 inline-block align-middle"
                      style={{ width: 6, height: 6, display: "inline-block", verticalAlign: "middle" }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 py-3">
            <Button
              variant={muted ? "destructive" : "outline"}
              size="icon"
              onClick={() => setMuted(!muted)}
              className="h-11 w-11 rounded-full"
            >
              {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            <Button
              variant={!videoOn ? "destructive" : "outline"}
              size="icon"
              onClick={() => setVideoOn(!videoOn)}
              className="h-11 w-11 rounded-full"
            >
              {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-full">
              <MonitorUp className="w-5 h-5" />
            </Button>
            <Button variant="destructive" size="icon" className="h-11 w-11 rounded-full">
              <PhoneOff className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="hidden w-80 shrink-0 rounded-[2rem] border border-border bg-card lg:flex lg:flex-col">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("transcript")}
              className={`flex-1 py-3 text-xs font-medium transition-colors ${
                activeTab === "transcript" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Transcript
              </span>
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-3 text-xs font-medium transition-colors ${
                activeTab === "chat" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Chat
              </span>
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {activeTab === "transcript" ? (
              meeting.transcriptLines.map((line, index) => (
                <motion.div
                  key={`${line.speaker}-${line.time}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary">{line.speaker}</span>
                    <span className="text-[10px] text-muted-foreground">{line.time}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{line.text}</p>
                </motion.div>
              ))
            ) : (
              <div className="mt-8 text-center text-sm text-muted-foreground">No chat messages yet</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

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
              <Link to="/meeting" search={{ meetingId: meeting.id }}>
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
