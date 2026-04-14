import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Users, FileText, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/briefing")({
  component: BriefingPage,
  head: () => ({
    meta: [
      { title: "Pre-Meeting Briefing — MeetFlow" },
      { name: "description", content: "AI-powered meeting preparation and briefing" },
    ],
  }),
});

const decisions = ["Adopted new CI/CD pipeline", "Approved Q2 budget allocation", "Deferred mobile redesign to Q3"];
const openTasks = [
  { title: "Finalize API v2 migration plan", done: false },
  { title: "Update staging environment", done: true },
  { title: "Review security audit results", done: false },
  { title: "Prepare demo for stakeholders", done: false },
];
const participants = ["JD", "SK", "AJ", "EM", "MC", "LK"];

function BriefingPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Sprint Planning</h1>
        <p className="text-muted-foreground text-sm mt-1">Pre-meeting briefing · Today at 10:00 AM</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Last meeting summary */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-semibold text-sm text-foreground">Last Meeting Summary</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The team reviewed Q1 deliverables and identified 3 blockers in the API migration. 
            Sarah presented the new testing framework proposal which received positive feedback. 
            Action items were distributed across frontend and backend teams.
          </p>
        </div>

        {/* Decisions */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <h3 className="font-heading font-semibold text-sm text-foreground">Decisions Taken</h3>
          <div className="space-y-2">
            {decisions.map((d, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-sm text-muted-foreground">{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Open tasks */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="font-heading font-semibold text-sm text-foreground">Open Tasks</h3>
        <div className="space-y-2">
          {openTasks.map((t, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              {t.done ? (
                <CheckCircle2 className="w-4 h-4 text-primary" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground" />
              )}
              <span className={`text-sm ${t.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {t.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Participants + CTA */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <Users className="w-4 h-4 text-muted-foreground" />
          <div className="flex -space-x-2">
            {participants.map((p, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-xs font-bold text-secondary-foreground"
              >
                {p}
              </div>
            ))}
          </div>
          <span className="text-sm text-muted-foreground">{participants.length} participants</span>
        </div>
        <Button variant="glow" size="lg">
          Join Meeting <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
