import { motion } from "framer-motion";

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  time: string;
  type: "meeting" | "task" | "group";
}

const activities: ActivityItem[] = [
  { id: "1", user: "Sarah", action: "completed task 'Update API docs'", time: "2 min ago", type: "task" },
  { id: "2", user: "Alex", action: "created meeting 'Task Review'", time: "15 min ago", type: "meeting" },
  { id: "3", user: "Mike", action: "joined group 'Backend Team'", time: "1h ago", type: "group" },
  { id: "4", user: "Emma", action: "approved summary for 'Design Sync'", time: "2h ago", type: "meeting" },
  { id: "5", user: "Chris", action: "assigned task to Sarah", time: "3h ago", type: "task" },
];

const typeColors: Record<string, string> = {
  meeting: "bg-accent/30 text-accent-foreground",
  task: "bg-primary/15 text-primary",
  group: "bg-secondary text-secondary-foreground",
};

export function ActivityFeed() {
  return (
    <div className="space-y-1">
      {activities.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-start gap-3 py-3 px-4 rounded-xl hover:bg-secondary/30 transition-all"
        >
          <div className="relative mt-1">
            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
            {i < activities.length - 1 && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-px h-8 bg-border" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-semibold text-foreground">{item.user}</span>
              <span className="text-muted-foreground"> {item.action}</span>
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${typeColors[item.type]}`}>
                {item.type}
              </span>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
