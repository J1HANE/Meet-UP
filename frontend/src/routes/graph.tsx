import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { groupsApi } from "@/lib/api/groups";
import { useMemo } from "react";

export const Route = createFileRoute("/graph")({
  component: GraphPage,
  head: () => ({
    meta: [
      { title: "Graph Explorer — MeetFlow" },
      { name: "description", content: "Visualize relationships between people, groups, and tasks" },
    ],
  }),
});

const typeStyles: Record<string, { bg: string; border: string; size: number }> = {
  person: { bg: "fill-primary", border: "stroke-primary/50", size: 20 },
  group: { bg: "fill-accent", border: "stroke-accent/50", size: 24 },
  task: { bg: "fill-chart-3", border: "stroke-chart-3/50", size: 16 },
  meeting: { bg: "fill-chart-1", border: "stroke-chart-1/50", size: 18 },
};

function GraphPage() {
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: groupsApi.getAllGroups,
  });

  const { nodes, edges } = useMemo(() => {
    const ns: Record<string, any> = {};
    const es: any[] = [];

    groups.forEach((g) => {
      // Add Group
      if (!ns[g.id]) {
        ns[g.id] = { id: g.id, label: g.name || `Group ${g.id.substring(0,4)}`, type: "group", x: Math.random() * 70 + 15, y: Math.random() * 70 + 15 };
      }

      // Task
      if (g.task?.task?.id) {
        const tid = `task-${g.task.task.id}`;
        if (!ns[tid]) {
          ns[tid] = { id: tid, label: g.task.task.title || `Task ${g.task.task.id}`, type: "task", x: Math.random() * 70 + 15, y: Math.random() * 70 + 15 };
        }
        es.push({ from: g.id, to: tid });
      }

      // Meeting
      if (g.meeting?.meeting?.id) {
        const mid = `meeting-${g.meeting.meeting.id}`;
        if (!ns[mid]) {
          ns[mid] = { id: mid, label: g.meeting.meeting.title || `Meeting ${g.meeting.meeting.id}`, type: "meeting", x: Math.random() * 70 + 15, y: Math.random() * 70 + 15 };
        }
        es.push({ from: g.id, to: mid });
      }

      // Members
      g.members?.forEach(m => {
        if (m.person?.id) {
          const pid = `person-${m.person.id}`;
          if (!ns[pid]) {
            ns[pid] = { id: pid, label: m.person.name || m.person.id, type: "person", x: Math.random() * 70 + 15, y: Math.random() * 70 + 15 };
          }
          es.push({ from: pid, to: g.id });
        }
      });

      // Leads
      g.leads?.forEach(l => {
        if (l.person?.id) {
          const pid = `person-${l.person.id}`;
          if (!ns[pid]) {
            ns[pid] = { id: pid, label: l.person.name || l.person.id, type: "person", x: Math.random() * 70 + 15, y: Math.random() * 70 + 15 };
          }
          es.push({ from: pid, to: g.id });
        }
      });
    });

    return { nodes: Object.values(ns), edges: es };
  }, [groups]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-7rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Graph Explorer</h1>
          <p className="text-muted-foreground text-sm mt-1">Interactive relationship visualization</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon"><ZoomIn className="w-4 h-4" /></Button>
          <Button variant="outline" size="icon"><ZoomOut className="w-4 h-4" /></Button>
          <Button variant="outline" size="icon"><Maximize2 className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="flex-1 rounded-2xl border border-border bg-card relative overflow-hidden">
        {isLoading ? (
           <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">Loading graph data...</div>
        ) : nodes.length === 0 ? (
           <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">No data to display. Form a group first!</div>
        ) : (
          <svg className="w-full h-full">
            {/* Edges */}
            {edges.map((edge, i) => {
              const from = nodes.find((n: any) => n.id === edge.from);
              const to = nodes.find((n: any) => n.id === edge.to);
              if (!from || !to) return null;
              return (
                <line
                  key={i}
                  x1={`${from.x}%`} y1={`${from.y}%`}
                  x2={`${to.x}%`} y2={`${to.y}%`}
                  className="stroke-border"
                  strokeWidth="1"
                  opacity="0.4"
                />
              );
            })}
            {/* Nodes */}
            {nodes.map((node: any) => {
              const style = typeStyles[node.type] || typeStyles.person;
              return (
                <g key={node.id} className="cursor-pointer">
                  <circle
                    cx={`${node.x}%`} cy={`${node.y}%`}
                    r={style.size}
                    className={`${style.bg} ${style.border} transition-all duration-200`}
                    strokeWidth="2"
                    opacity="0.8"
                  />
                  <text
                    x={`${node.x}%`} y={`${node.y + 6}%`}
                    textAnchor="middle"
                    className="fill-foreground text-[10px] font-medium"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 glass-panel rounded-xl p-3 flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary" /> Person</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-accent" /> Group</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-chart-3" /> Task</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-chart-1" /> Meeting</span>
        </div>
      </div>
    </motion.div>
  );
}
