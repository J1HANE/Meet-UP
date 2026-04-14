import { motion } from "framer-motion";
import { Circle, CheckCircle2 } from "lucide-react";

interface TaskItemProps {
  title: string;
  assignee: string;
  status: "todo" | "in_progress" | "done";
  tag?: string;
}

export function TaskItem({ title, assignee, status, tag }: TaskItemProps) {
  return (
    <motion.div
      whileHover={{ x: 2 }}
      className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-secondary/50 transition-all duration-200 group"
    >
      {status === "done" ? (
        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
      ) : (
        <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
          {title}
        </p>
      </div>
      {tag && (
        <span className="px-2 py-0.5 rounded-md bg-accent/30 text-accent-foreground text-xs">
          {tag}
        </span>
      )}
      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-secondary-foreground">
        {assignee}
      </div>
    </motion.div>
  );
}
