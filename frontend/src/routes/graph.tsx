import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/graph")({
  component: GraphPage,
  head: () => ({
    meta: [
      { title: "Graph Explorer — MeetFlow" },
      { name: "description", content: "Visualize relationships between people, groups, and tasks" },
    ],
  }),
});

// Simulated graph nodes
const nodes = [
  { id: "1", label: "John D.", type: "person", x: 50, y: 40 },
  { id: "2", label: "Sarah K.", type: "person", x: 30, y: 60 },
  { id: "3", label: "Alex J.", type: "person", x: 70, y: 55 },
  { id: "4", label: "Emma C.", type: "person", x: 55, y: 75 },
  { id: "5", label: "Frontend", type: "group", x: 40, y: 30 },
  { id: "6", label: "Backend", type: "group", x: 65, y: 25 },
  { id: "7", label: "API Migration", type: "task", x: 20, y: 45 },
  { id: "8", label: "Auth Upgrade", type: "task", x: 80, y: 40 },
];

const edges = [
  { from: "1", to: "5" }, { from: "1", to: "6" }, { from: "2", to: "5" },
  { from: "3", to: "6" }, { from: "4", to: "5" }, { from: "1", to: "7" },
  { from: "2", to: "7" }, { from: "3", to: "8" },
];

const typeStyles: Record<string, { bg: string; border: string; size: number }> = {
  person: { bg: "fill-primary", border: "stroke-primary/50", size: 20 },
  group: { bg: "fill-accent", border: "stroke-accent/50", size: 24 },
  task: { bg: "fill-chart-3", border: "stroke-chart-3/50", size: 16 },
};

function GraphPage() {
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
        <svg className="w-full h-full">
          {/* Edges */}
          {edges.map((edge, i) => {
            const from = nodes.find((n) => n.id === edge.from)!;
            const to = nodes.find((n) => n.id === edge.to)!;
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
          {nodes.map((node) => {
            const style = typeStyles[node.type];
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

        {/* Legend */}
        <div className="absolute bottom-4 left-4 glass-panel rounded-xl p-3 flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary" /> Person</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-accent" /> Group</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-chart-3" /> Task</span>
        </div>
      </div>
    </motion.div>
  );
}
