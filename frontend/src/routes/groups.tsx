import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Users, GitFork, GitMerge, ListTodo, Network, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/groups")({
  component: GroupsPage,
  head: () => ({
    meta: [
      { title: "Groups — MeetFlow" },
      { name: "description", content: "Manage your collaborative groups" },
    ],
  }),
});

const groups = [
  { name: "Frontend Team", members: ["JD", "SK", "EM", "AJ"], tasks: 8, meetings: 12 },
  { name: "Backend Team", members: ["SK", "MC", "JD", "LK"], tasks: 5, meetings: 9 },
  { name: "Design Sprint", members: ["EM", "AJ", "SK", "MC", "JD", "LK"], tasks: 12, meetings: 6 },
  { name: "Security Guild", members: ["JD", "MC"], tasks: 3, meetings: 4 },
];

function GroupsPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Groups</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your collaborative groups (tweens)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((g, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -2 }}
            className="rounded-2xl border border-border bg-card p-5 space-y-4 hover:border-primary/20 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-surface flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-foreground">{g.name}</h3>
              </div>
            </div>

            <div className="flex -space-x-2">
              {g.members.map((m, j) => (
                <div key={j} className="w-8 h-8 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-xs font-bold text-secondary-foreground">
                  {m}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><ListTodo className="w-3.5 h-3.5" /> {g.tasks} tasks</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {g.meetings} meetings</span>
              <span className="flex items-center gap-1"><Network className="w-3.5 h-3.5" /> Graph</span>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm"><GitFork className="w-3.5 h-3.5" /> Fork</Button>
              <Button variant="outline" size="sm"><GitMerge className="w-3.5 h-3.5" /> Merge</Button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
