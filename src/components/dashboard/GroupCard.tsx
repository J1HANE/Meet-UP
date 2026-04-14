import { motion } from "framer-motion";
import { Users } from "lucide-react";

interface GroupCardProps {
  name: string;
  members: string[];
  taskCount: number;
}

export function GroupCard({ name, members, taskCount }: GroupCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl p-4 bg-card border border-border hover:border-primary/20 transition-all duration-300"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/30 flex items-center justify-center">
          <Users className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h4 className="font-heading font-semibold text-sm text-foreground">{name}</h4>
          <p className="text-xs text-muted-foreground">{taskCount} active tasks</p>
        </div>
      </div>
      <div className="flex items-center mt-3 -space-x-2">
        {members.slice(0, 4).map((m, i) => (
          <div
            key={i}
            className="w-7 h-7 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-[10px] font-bold text-secondary-foreground"
          >
            {m}
          </div>
        ))}
        {members.length > 4 && (
          <div className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] text-muted-foreground">
            +{members.length - 4}
          </div>
        )}
      </div>
    </motion.div>
  );
}
