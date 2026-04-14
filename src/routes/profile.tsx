import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Clock, Users, ListTodo, Tag } from "lucide-react";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Profile — MeetFlow" },
      { name: "description", content: "Your personal dashboard" },
    ],
  }),
});

const topics = [
  { label: "API Design", weight: 3 },
  { label: "Authentication", weight: 2 },
  { label: "Sprint Planning", weight: 3 },
  { label: "Code Review", weight: 2 },
  { label: "Security", weight: 1 },
  { label: "DevOps", weight: 2 },
  { label: "UX Research", weight: 1 },
  { label: "Performance", weight: 2 },
];

const stats = [
  { icon: Clock, label: "Meetings this month", value: "24" },
  { icon: Users, label: "Active groups", value: "4" },
  { icon: ListTodo, label: "Tasks completed", value: "18" },
];

function ProfilePage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      {/* Profile header */}
      <div className="rounded-2xl gradient-surface border border-primary/20 p-6 flex items-center gap-6">
        <div className="w-20 h-20 rounded-2xl gradient-accent flex items-center justify-center text-2xl font-heading font-bold text-primary-foreground">
          JD
        </div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">John Doe</h1>
          <p className="text-muted-foreground text-sm">Product Engineer · Joined Jan 2025</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 text-center">
            <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-heading font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Topics */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-heading font-semibold text-foreground">Recurring Topics</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {topics.map((t, i) => (
            <motion.span
              key={i}
              whileHover={{ scale: 1.05 }}
              className="px-3 py-1.5 rounded-xl border border-border text-sm transition-all hover:border-primary/30 hover:bg-primary/5"
              style={{ fontSize: `${12 + t.weight * 2}px` }}
            >
              {t.label}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
