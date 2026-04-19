import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MeetingCard } from "@/components/dashboard/MeetingCard";
import { TaskItem } from "@/components/dashboard/TaskItem";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { GroupCard } from "@/components/dashboard/GroupCard";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard — MeetFlow" },
      { name: "description", content: "Your collaborative meeting & task intelligence hub" },
    ],
  }),
});

const meetings = [
  { title: "Sprint Planning", time: "10:00 AM", participants: 6, briefing: "AI suggests reviewing the blocked API integration task and finalizing Q2 roadmap priorities.", isNext: true },
  { title: "Design Review", time: "2:00 PM", participants: 4, briefing: "3 new mockups to review. Previous feedback on navigation flow still unresolved." },
  { title: "1:1 with Sarah", time: "4:30 PM", participants: 2, briefing: "Follow up on performance review goals and training budget request." },
];

const tasks = [
  { title: "Update API documentation", assignee: "SK", status: "in_progress" as const, tag: "Backend" },
  { title: "Fix login redirect bug", assignee: "AJ", status: "todo" as const, tag: "Auth" },
  { title: "Design onboarding flow", assignee: "EM", status: "in_progress" as const, tag: "UX" },
  { title: "Write unit tests for payments", assignee: "MC", status: "done" as const, tag: "QA" },
  { title: "Review PR #284", assignee: "JD", status: "todo" as const },
];

const groups = [
  { name: "Frontend Team", members: ["SK", "AJ", "EM", "MC", "JD"], taskCount: 8 },
  { name: "Backend Team", members: ["SK", "MC", "JD"], taskCount: 5 },
  { name: "Design Sprint", members: ["EM", "AJ", "SK", "MC", "JD", "LK"], taskCount: 12 },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

function Dashboard() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          Good morning, <span className="glow-text text-primary">John</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">You have 3 meetings today and 5 active tasks</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meetings */}
        <motion.div variants={item} className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-foreground">Upcoming Meetings</h2>
            <span className="text-xs text-muted-foreground">Today</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meetings.map((m, i) => (
              <MeetingCard key={i} {...m} />
            ))}
          </div>
        </motion.div>

        {/* Groups */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-foreground">Your Groups</h2>
            <span className="text-xs text-primary cursor-pointer hover:underline">View all</span>
          </div>
          <div className="space-y-3">
            {groups.map((g, i) => (
              <GroupCard key={i} {...g} />
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Tasks */}
        <motion.div variants={item} className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-foreground">Active Tasks</h2>
            <span className="text-xs text-primary cursor-pointer hover:underline">View board</span>
          </div>
          <div className="rounded-2xl border border-border bg-card divide-y divide-border">
            {tasks.map((t, i) => (
              <TaskItem key={i} {...t} />
            ))}
          </div>
        </motion.div>

        {/* Activity */}
        <motion.div variants={item} className="lg:col-span-2">
          <h2 className="font-heading font-semibold text-foreground mb-4">Activity</h2>
          <div className="rounded-2xl border border-border bg-card">
            <ActivityFeed />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
