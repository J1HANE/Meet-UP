import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, FileText, UserPlus } from "lucide-react";

export const Route = createFileRoute("/summary")({
  component: SummaryPage,
  head: () => ({
    meta: [
      { title: "Post-Meeting Summary — MeetFlow" },
      { name: "description", content: "AI-generated meeting summary and action items" },
    ],
  }),
});

const actionItems = [
  { title: "Complete API v2 auth migration", assignee: "Alex J.", suggested: true },
  { title: "Update frontend adapters for new endpoints", assignee: "Emma C.", suggested: true },
  { title: "Schedule security review for next week", assignee: "John D.", suggested: false },
  { title: "Prepare staging deployment plan", assignee: "Sarah K.", suggested: true },
];

const decisions = [
  "API v2 migration deadline extended to end of month",
  "Auth module will use OAuth2 with PKCE flow",
  "Frontend team will implement feature flags for gradual rollout",
];

function SummaryPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Sprint Planning — Summary</h1>
        <p className="text-muted-foreground text-sm mt-1">Today at 10:00 AM · Duration: 45 min</p>
      </div>

      {/* AI Summary */}
      <div className="rounded-2xl gradient-surface border border-primary/20 p-6 glow-border">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-semibold text-foreground">AI-Generated Summary</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The team reviewed the API v2 migration progress, which is at 80% completion. Alex volunteered to handle the auth migration this week. 
          Emma confirmed frontend adapters are ready for deployment once endpoints are live. The team agreed to extend the migration deadline 
          and implement feature flags for a gradual rollout. A security review was scheduled for next week.
        </p>
      </div>

      {/* Action Items */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="font-heading font-semibold text-foreground">Action Items</h3>
        <div className="space-y-2">
          {actionItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-secondary/30 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="flex-1 text-sm text-foreground">{item.title}</span>
              <div className="flex items-center gap-2">
                {item.suggested && (
                  <span className="px-2 py-0.5 rounded-md bg-primary/15 text-primary text-[10px] font-medium flex items-center gap-1">
                    <UserPlus className="w-3 h-3" /> AI suggested
                  </span>
                )}
                <span className="text-xs text-muted-foreground">{item.assignee}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decisions */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-heading font-semibold text-foreground">Decisions Log</h3>
        </div>
        <div className="space-y-2">
          {decisions.map((d, i) => (
            <div key={i} className="flex items-start gap-2 py-1">
              <div className="neon-dot mt-1.5 shrink-0" />
              <span className="text-sm text-muted-foreground">{d}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="glow" size="lg">
          Approve & Save
        </Button>
      </div>
    </motion.div>
  );
}
