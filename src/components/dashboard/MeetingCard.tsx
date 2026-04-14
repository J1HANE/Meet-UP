import { motion } from "framer-motion";
import { Clock, Users, Sparkles } from "lucide-react";

interface MeetingCardProps {
  title: string;
  time: string;
  participants: number;
  briefing: string;
  isNext?: boolean;
}

export function MeetingCard({ title, time, participants, briefing, isNext }: MeetingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`rounded-2xl p-5 border transition-all duration-300 ${
        isNext
          ? "gradient-surface glow-border border-primary/30"
          : "bg-card border-border hover:border-primary/20"
      }`}
    >
      {isNext && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium mb-3">
          <div className="live-dot" style={{ width: 6, height: 6 }} />
          Next up
        </div>
      )}
      <h3 className="font-heading font-semibold text-foreground text-base">{title}</h3>
      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {time}
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          {participants}
        </span>
      </div>
      <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-muted/50">
        <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">{briefing}</p>
      </div>
    </motion.div>
  );
}
