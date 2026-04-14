import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight, Clock, FileText, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/memory")({
  component: MemoryPage,
  head: () => ({
    meta: [
      { title: "Memory Explorer — MeetFlow" },
      { name: "description", content: "Browse your meeting history and context" },
    ],
  }),
});

const meetings = [
  {
    id: "1",
    title: "Sprint Planning",
    date: "Apr 14, 2026",
    time: "10:00 AM",
    decisions: ["Extended API deadline", "Adopted OAuth2 PKCE", "Feature flags for rollout"],
    transcript: "John: Let's start with the API migration status...\nSarah: The v2 endpoints are 80% complete...",
  },
  {
    id: "2",
    title: "Design Sync",
    date: "Apr 11, 2026",
    time: "2:00 PM",
    decisions: ["New nav pattern approved", "Mobile-first approach"],
    transcript: "Emma: I've prepared three navigation concepts...\nAlex: I prefer option B for its simplicity...",
  },
  {
    id: "3",
    title: "Security Review",
    date: "Apr 9, 2026",
    time: "11:00 AM",
    decisions: ["Upgrade auth library", "Add rate limiting"],
    transcript: "Mike: The audit found two medium severity issues...\nJohn: Let's prioritize the auth upgrade...",
  },
];

function MemoryPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Context & Memory</h1>
        <p className="text-muted-foreground text-sm mt-1">Navigate through your meeting history and decisions</p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-4">
          {meetings.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-10"
            >
              {/* Dot */}
              <div className="absolute left-2.5 top-5 neon-dot" />

              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-secondary/30 transition-all"
                >
                  <div>
                    <h3 className="font-heading font-semibold text-foreground">{m.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {m.date} · {m.time}</span>
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {m.decisions.length} decisions</span>
                    </div>
                  </div>
                  {expanded === m.id ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </button>

                {expanded === m.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t border-border p-5 space-y-4"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Decisions</h4>
                      <div className="space-y-1.5">
                        {m.decisions.map((d, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <div className="neon-dot shrink-0" style={{ width: 6, height: 6 }} />
                            <span className="text-sm text-foreground">{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> Transcript
                      </h4>
                      <pre className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-body bg-muted/30 rounded-xl p-3">
                        {m.transcript}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
