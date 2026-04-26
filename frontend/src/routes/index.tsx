import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { MeetingCard } from "@/components/dashboard/MeetingCard";
import { TaskItem } from "@/components/dashboard/TaskItem";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { GroupCard } from "@/components/dashboard/GroupCard";
import { Button } from "@/components/ui/button";
import { meetings } from "@/lib/meetings";

export const Route = createFileRoute("/")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Dashboard — MeetFlow" },
      { name: "description", content: "Your collaborative meeting & task intelligence hub" },
    ],
  }),
});

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
  { name: "Design Ops", members: ["EM", "AJ", "SK", "MC", "JD", "LK"], taskCount: 12 },
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
      <motion.div
        variants={item}
        className="flex flex-col gap-4 rounded-[2rem] border border-primary/15 bg-card/60 p-5 shadow-[0_20px_60px_oklch(0.08_0.03_280/0.45)] lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Good morning, <span className="glow-text text-primary">John</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You have {meetings.length} meetings today and {tasks.filter((task) => task.status !== "done").length} active tasks
          </p>
        </div>
        <Button
          size="lg"
          className="bg-orange-500 text-slate-950 shadow-[0_16px_40px_rgba(249,115,22,0.35)] hover:bg-orange-400 hover:shadow-[0_18px_48px_rgba(251,146,60,0.45)]"
        >
          <Plus className="w-4 h-4" />
          Create a meeting
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div variants={item} className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading font-semibold text-foreground">Upcoming Meetings</h2>
            <span className="text-xs text-muted-foreground">Today</span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {meetings.map((meeting, index) => (
              <MeetingCard
                key={meeting.id}
                title={meeting.title}
                time={meeting.time}
                participants={meeting.participants.length}
                briefing={meeting.briefing}
                isNext={index === 0}
              />
            ))}
          </div>
        </motion.div>

        <motion.div variants={item}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading font-semibold text-foreground">Your Groups</h2>
            <span className="cursor-pointer text-xs text-primary hover:underline">View all</span>
          </div>
          <div className="space-y-3">
            {groups.map((group) => (
              <GroupCard key={group.name} {...group} />
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <motion.div variants={item} className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading font-semibold text-foreground">Active Tasks</h2>
            <span className="cursor-pointer text-xs text-primary hover:underline">View board</span>
          </div>
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {tasks.map((task, index) => (
              <TaskItem key={`${task.title}-${index}`} {...task} />
            ))}
          </div>
        </motion.div>

        <motion.div variants={item} className="lg:col-span-2">
          <h2 className="mb-4 font-heading font-semibold text-foreground">Activity</h2>
          <div className="rounded-2xl border border-border bg-card">
            <ActivityFeed />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
