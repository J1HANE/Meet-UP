import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, MonitorUp, PhoneOff, MessageSquare, FileText, Users, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Route = createFileRoute("/meeting")({
  component: MeetingRoom,
  head: () => ({
    meta: [
      { title: "Meeting Room — MeetFlow" },
      { name: "description", content: "Live meeting session with real-time collaboration" },
    ],
  }),
});

const participants = [
  { name: "John Doe", initials: "JD", speaking: true },
  { name: "Sarah Kim", initials: "SK", speaking: false },
  { name: "Alex Johnson", initials: "AJ", speaking: false },
  { name: "Emma Chen", initials: "EC", speaking: false },
];

const transcriptLines = [
  { speaker: "John", text: "Let's start with the API migration status.", time: "10:01" },
  { speaker: "Sarah", text: "The v2 endpoints are 80% complete. We need to finalize auth.", time: "10:02" },
  { speaker: "Alex", text: "I can take the auth migration this week.", time: "10:03" },
  { speaker: "Emma", text: "The frontend adapters are ready once the endpoints are live.", time: "10:04" },
];

function MeetingRoom() {
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "transcript">("transcript");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-7rem)] flex gap-4"
    >
      {/* Left sidebar */}
      <div className="w-56 shrink-0 space-y-4 hidden xl:block">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-heading text-sm font-semibold text-foreground">Participants</h3>
          </div>
          {participants.map((p, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-secondary-foreground">
                  {p.initials}
                </div>
                {p.speaking && <div className="absolute -bottom-0.5 -right-0.5 live-dot" style={{ width: 6, height: 6 }} />}
              </div>
              <span className="text-sm text-foreground">{p.name}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-heading text-sm font-semibold text-foreground">Active Tasks</h3>
          </div>
          <div className="text-xs text-muted-foreground space-y-1.5">
            <p>• Finalize auth migration</p>
            <p>• Review API docs</p>
            <p>• Update staging env</p>
          </div>
        </div>
      </div>

      {/* Center - Video grid */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 grid grid-cols-2 gap-3 mb-4">
          {participants.map((p, i) => (
            <div
              key={i}
              className={`rounded-2xl bg-muted/30 border flex items-center justify-center relative ${
                p.speaking ? "border-primary/50 glow-border" : "border-border"
              }`}
            >
              <div className="w-16 h-16 rounded-full gradient-surface flex items-center justify-center text-xl font-heading font-bold text-foreground">
                {p.initials}
              </div>
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg glass-panel text-xs text-foreground">
                {p.name}
                {p.speaking && <span className="ml-1.5 inline-block live-dot" style={{ width: 6, height: 6, display: "inline-block", verticalAlign: "middle" }} />}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 py-3">
          <Button variant={muted ? "destructive" : "outline"} size="icon" onClick={() => setMuted(!muted)} className="rounded-full w-11 h-11">
            {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
          <Button variant={!videoOn ? "destructive" : "outline"} size="icon" onClick={() => setVideoOn(!videoOn)} className="rounded-full w-11 h-11">
            {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>
          <Button variant="outline" size="icon" className="rounded-full w-11 h-11">
            <MonitorUp className="w-5 h-5" />
          </Button>
          <Button variant="destructive" size="icon" className="rounded-full w-11 h-11">
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-72 shrink-0 rounded-2xl border border-border bg-card flex flex-col hidden lg:flex">
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("transcript")}
            className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === "transcript" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Transcript
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === "chat" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Chat
          </button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {activeTab === "transcript" ? (
            transcriptLines.map((line, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-primary">{line.speaker}</span>
                  <span className="text-[10px] text-muted-foreground">{line.time}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{line.text}</p>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center mt-8">No messages yet</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
