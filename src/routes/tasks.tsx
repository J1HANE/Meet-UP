import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, Filter } from "lucide-react";

export const Route = createFileRoute("/tasks")({
  component: TaskBoard,
  head: () => ({
    meta: [
      { title: "Task Board — MeetFlow" },
      { name: "description", content: "Manage and track your team's tasks" },
    ],
  }),
});

interface Task {
  id: string;
  title: string;
  assignee: string;
  tag: string;
  status: "todo" | "in_progress" | "done";
}

const allTasks: Task[] = [
  { id: "1", title: "Finalize API v2 migration plan", assignee: "AJ", tag: "Backend", status: "todo" },
  { id: "2", title: "Review security audit results", assignee: "JD", tag: "Security", status: "todo" },
  { id: "3", title: "Update API documentation", assignee: "SK", tag: "Docs", status: "in_progress" },
  { id: "4", title: "Design onboarding flow", assignee: "EM", tag: "UX", status: "in_progress" },
  { id: "5", title: "Fix login redirect bug", assignee: "AJ", tag: "Auth", status: "in_progress" },
  { id: "6", title: "Write unit tests for payments", assignee: "MC", tag: "QA", status: "done" },
  { id: "7", title: "Set up CI/CD pipeline", assignee: "JD", tag: "DevOps", status: "done" },
];

const columns = [
  { key: "todo" as const, label: "To Do", color: "text-muted-foreground" },
  { key: "in_progress" as const, label: "In Progress", color: "text-primary" },
  { key: "done" as const, label: "Done", color: "text-chart-3" },
];

function TaskCard({ task }: { task: Task }) {
  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className="rounded-xl border border-border bg-card p-4 space-y-3 hover:border-primary/20 transition-all"
    >
      <p className="text-sm font-medium text-foreground">{task.title}</p>
      <div className="flex items-center justify-between">
        <span className="px-2 py-0.5 rounded-md bg-accent/30 text-accent-foreground text-[10px] font-medium">
          {task.tag}
        </span>
        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary-foreground">
          {task.assignee}
        </div>
      </div>
    </motion.div>
  );
}

function TaskBoard() {
  const [view, setView] = useState<"kanban" | "list">("kanban");

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Task Board</h1>
          <p className="text-muted-foreground text-sm mt-1">{allTasks.length} tasks across all groups</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-3.5 h-3.5" /> Filter
          </Button>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "kanban" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {view === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col) => (
            <div key={col.key} className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <h3 className={`font-heading text-sm font-semibold ${col.color}`}>{col.label}</h3>
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {allTasks.filter((t) => t.status === col.key).length}
                </span>
              </div>
              <div className="space-y-3 min-h-[200px] rounded-2xl bg-muted/20 p-3 border border-border/50">
                {allTasks
                  .filter((t) => t.status === col.key)
                  .map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card divide-y divide-border">
          {allTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/30 transition-all">
              <span className={`w-2 h-2 rounded-full ${task.status === "done" ? "bg-chart-3" : task.status === "in_progress" ? "bg-primary" : "bg-muted-foreground"}`} />
              <span className="flex-1 text-sm font-medium text-foreground">{task.title}</span>
              <span className="px-2 py-0.5 rounded-md bg-accent/30 text-accent-foreground text-[10px]">{task.tag}</span>
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary-foreground">{task.assignee}</div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
