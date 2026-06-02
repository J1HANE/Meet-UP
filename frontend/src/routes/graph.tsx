import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ZoomIn, ZoomOut, RefreshCw, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { groupsApi } from "@/lib/api/groups";
import { useMemo, useState, useEffect, useRef } from "react";

export const Route = createFileRoute("/graph")({
  component: GraphPage,
  head: () => ({
    meta: [
      { title: "Graph Explorer — MeetFlow" },
      { name: "description", content: "Visualize relationships between people, groups, and tasks" },
    ],
  }),
});

interface Node {
  id: string;
  label: string;
  detail?: string;
  type: "person" | "group" | "task" | "meeting";
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number;
  fy?: number;
}

interface Edge {
  from: string;
  to: string;
  relation: string;
}

const typeStyles: Record<string, { bg: string; border: string; size: number; gradient: string; label: string; text: string }> = {
  person: { bg: "#f97316", border: "#ea580c", size: 24, gradient: "url(#personGrad)", label: "Person", text: "P" },
  group: { bg: "#c084fc", border: "#a855f7", size: 30, gradient: "url(#groupGrad)", label: "Group", text: "G" },
  task: { bg: "#34d399", border: "#10b981", size: 22, gradient: "url(#taskGrad)", label: "Task", text: "T" },
  meeting: { bg: "#f87171", border: "#f87171", size: 23, gradient: "url(#meetingGrad)", label: "Meeting", text: "M" },
};

function getPersonLabel(person: { name?: string; email?: string; id?: string }): string {
  return person.name || person.email || person.id || "Unknown";
}

function GraphPage() {
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: groupsApi.getAllGroups,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Interaction State
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Pan & Zoom State
  const [scale, setScale] = useState(0.85);
  const [translateX, setTranslateX] = useState(100);
  const [translateY, setTranslateY] = useState(80);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });

  // Map backend groups to initial nodes & edges list
  useEffect(() => {
    if (!groups.length) return;

    const ns: Record<string, Node> = {};
    const es: Edge[] = [];

    const getCenter = () => {
      const w = containerRef.current?.clientWidth || 800;
      const h = containerRef.current?.clientHeight || 500;
      return { x: w / 2, y: h / 2 };
    };

    const center = getCenter();

    groups.forEach((g, index) => {
      const angle = (index / Math.max(groups.length, 1)) * Math.PI * 2;
      const radius = 180 + Math.floor(index / 6) * 130;
      const groupX = center.x + Math.cos(angle) * radius;
      const groupY = center.y + Math.sin(angle) * radius;

      // Add Group
      if (!ns[g.id]) {
        ns[g.id] = {
          id: g.id,
          label: g.name || g.task?.task?.title || `Group ${g.id.substring(0, 8)}`,
          detail: `State: ${g.state}`,
          type: "group",
          x: groupX,
          y: groupY,
          vx: 0,
          vy: 0,
        };
      }

      // Add Task
      if (g.task?.task?.id) {
        const tid = `task-${g.task.task.id}`;
        if (!ns[tid]) {
          ns[tid] = {
            id: tid,
            label: g.task.task.title || `Task ${String(g.task.task.id).slice(0, 8)}`,
            detail: String(g.task.task.id),
            type: "task",
            x: groupX - 150,
            y: groupY,
            vx: 0,
            vy: 0,
          };
        }
        es.push({ from: g.id, to: tid, relation: "WORKS_ON" });
      }

      // Add Meeting
      if (g.meeting?.meeting?.id) {
        const mid = `meeting-${g.meeting.meeting.id}`;
        if (!ns[mid]) {
          ns[mid] = {
            id: mid,
            label: g.meeting.meeting.title || `Meeting ${String(g.meeting.meeting.id).slice(0, 8)}`,
            detail: String(g.meeting.meeting.id),
            type: "meeting",
            x: groupX + 150,
            y: groupY,
            vx: 0,
            vy: 0,
          };
        }
        es.push({ from: g.id, to: mid, relation: "FORMED_IN" });
      }

      // Add Members
      g.members?.forEach((m, memberIndex) => {
        if (m.person?.id && !m.leftAt) {
          const pid = `person-${m.person.id}`;
          if (!ns[pid]) {
            const memberAngle = angle + ((memberIndex + 1) * Math.PI) / 5;
            ns[pid] = {
              id: pid,
              label: getPersonLabel(m.person),
              detail: m.roleInGroup,
              type: "person",
              x: groupX + Math.cos(memberAngle) * 105,
              y: groupY + Math.sin(memberAngle) * 105,
              vx: 0,
              vy: 0,
            };
          }
          es.push({ from: pid, to: g.id, relation: "MEMBER_OF" });
        }
      });

      // Add Leads
      g.leads?.forEach((l) => {
        if (l.person?.id && !l.toDate) {
          const pid = `person-${l.person.id}`;
          if (!ns[pid]) {
            ns[pid] = {
              id: pid,
              label: getPersonLabel(l.person),
              detail: "Lead",
              type: "person",
              x: groupX,
              y: groupY - 130,
              vx: 0,
              vy: 0,
            };
          }
          es.push({ from: pid, to: g.id, relation: "LEADS" });
        }
      });
    });

    setNodes(Object.values(ns));
    setEdges(es);
  }, [groups]);

  // Run Custom Physics Force-Directed Loop
  useEffect(() => {
    if (nodes.length === 0) return;

    let animId: number;

    const tick = () => {
      const width = containerRef.current?.clientWidth || 800;
      const height = containerRef.current?.clientHeight || 500;

      const REPULSION = 2600;
      const ATTRACTION = 0.025;
      const CENTER_FORCE = 0.006;
      const DAMPING = 0.78;
      const LINK_DIST = 145;

      setNodes((prevNodes) => {
        const nextNodes = prevNodes.map((n) => ({ ...n }));
        const nodeMap: Record<string, Node> = {};
        nextNodes.forEach((n) => {
          nodeMap[n.id] = n;
        });

        // 1. Repulsion force between all nodes
        for (let i = 0; i < nextNodes.length; i++) {
          const n1 = nextNodes[i];
          for (let j = i + 1; j < nextNodes.length; j++) {
            const n2 = nextNodes[j];
            const dx = n2.x - n1.x;
            const dy = n2.y - n1.y;
            const distSq = dx * dx + dy * dy + 1;
            const dist = Math.sqrt(distSq);

            if (dist < 520) {
              const force = REPULSION / distSq;
              const fx = force * (dx / dist);
              const fy = force * (dy / dist);

              n1.vx -= fx;
              n1.vy -= fy;
              n2.vx += fx;
              n2.vy += fy;
            }
          }
        }

        // 2. Attraction force along edges
        edges.forEach((edge) => {
          const n1 = nodeMap[edge.from];
          const n2 = nodeMap[edge.to];
          if (!n1 || !n2) return;

          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          const force = (dist - LINK_DIST) * ATTRACTION;
          const fx = force * (dx / dist);
          const fy = force * (dy / dist);

          n1.vx += fx;
          n1.vy += fy;
          n2.vx -= fx;
          n2.vy -= fy;
        });

        // 3. Gravity pulling toward center
        const cx = width / 2;
        const cy = height / 2;
        nextNodes.forEach((n) => {
          const dx = cx - n.x;
          const dy = cy - n.y;
          n.vx += dx * CENTER_FORCE;
          n.vy += dy * CENTER_FORCE;
        });

        // 4. Update coordinates & apply damping
        nextNodes.forEach((n) => {
          if (n.id === draggedNodeId) {
            // Keep fixed if dragged
            n.vx = 0;
            n.vy = 0;
          } else {
            n.vx *= DAMPING;
            n.vy *= DAMPING;

            // Speed limit
            const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
            if (speed > 10) {
              n.vx = (n.vx / speed) * 10;
              n.vy = (n.vy / speed) * 10;
            }

            n.x += n.vx;
            n.y += n.vy;
          }
        });

        return nextNodes;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [nodes.length, edges, draggedNodeId]);

  // Translate client coordinates to SVG graph canvas coordinates
  const getSvgCoords = (e: React.MouseEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    return {
      x: (clientX - translateX) / scale,
      y: (clientY - translateY) / scale,
    };
  };

  // Drag Node Logic
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setDraggedNodeId(nodeId);
    setSelectedNodeId(nodeId);
    
    // Set fixed starting coordinates
    const coords = getSvgCoords(e);
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, fx: coords.x, fy: coords.y, x: coords.x, y: coords.y } : n))
    );
  };

  // Pan / Canvas MouseDown
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (draggedNodeId) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX - translateX, y: e.clientY - translateY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNodeId) {
      // Update dragged node position
      const coords = getSvgCoords(e);
      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggedNodeId
            ? { ...n, x: coords.x, y: coords.y, fx: coords.x, fy: coords.y }
            : n
        )
      );
    } else if (isPanning) {
      // Pan canvas
      setTranslateX(e.clientX - panStart.current.x);
      setTranslateY(e.clientY - panStart.current.y);
    }
  };

  const handleMouseUp = () => {
    if (draggedNodeId) {
      // Release node
      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggedNodeId ? { ...n, fx: undefined, fy: undefined } : n
        )
      );
      setDraggedNodeId(null);
    }
    setIsPanning(false);
  };

  // Scroll Zoom Logic
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const zoomFactor = 1.08;
    const nextScale = e.deltaY < 0 ? scale * zoomFactor : scale / zoomFactor;
    const boundedScale = Math.max(0.2, Math.min(nextScale, 4));

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const scaleRatio = boundedScale / scale;
    setTranslateX(mouseX - (mouseX - translateX) * scaleRatio);
    setTranslateY(mouseY - (mouseY - translateY) * scaleRatio);
    setScale(boundedScale);
  };

  // Button Zoom Logic
  const zoomIn = () => {
    setScale((s) => Math.min(s * 1.2, 4));
  };
  const zoomOut = () => {
    setScale((s) => Math.max(s / 1.2, 0.2));
  };

  // Center Graph View
  const resetView = () => {
    if (nodes.length === 0) return;
    const w = containerRef.current?.clientWidth || 800;
    const h = containerRef.current?.clientHeight || 500;

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    nodes.forEach((n) => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });

    const graphW = maxX - minX || 1;
    const graphH = maxY - minY || 1;

    const padding = 80;
    const scaleX = (w - padding * 2) / graphW;
    const scaleY = (h - padding * 2) / graphH;
    const nextScale = Math.max(0.3, Math.min(scaleX, scaleY, 1.1));

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    setScale(nextScale);
    setTranslateX(w / 2 - centerX * nextScale);
    setTranslateY(h / 2 - centerY * nextScale);
  };

  // Auto-recenter on initial load
  const initialCentered = useRef(false);
  useEffect(() => {
    if (nodes.length > 0 && !initialCentered.current) {
      const timer = setTimeout(() => {
        resetView();
        initialCentered.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [nodes.length]);

  // Interactive Hovering Highlights
  const activeRelationNodeIds = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();
    const neighbors = new Set<string>([hoveredNodeId]);
    edges.forEach((e) => {
      if (e.from === hoveredNodeId) neighbors.add(e.to);
      if (e.to === hoveredNodeId) neighbors.add(e.from);
    });
    return neighbors;
  }, [hoveredNodeId, edges]);

  const selectedNodeInfo = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId, nodes]);

  // Color/style mapping for relations
  const getRelationColor = (relation: string) => {
    switch (relation) {
      case "WORKS_ON":
        return "#10b981"; // Emerald Task
      case "MEMBER_OF":
        return "#a855f7"; // Purple Member
      case "LEADS":
        return "#f97316"; // Orange Lead
      case "FORMED_IN":
        return "#ef4444"; // Coral Meeting
      default:
        return "#64748b";
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-7rem)] flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" /> Graph Explorer
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Explore relationships between people, groups, and meetings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={zoomIn} title="Zoom In">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={zoomOut} title="Zoom Out">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={resetView} title="Recenter View">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* SVG Visualization Canvas */}
        <div
          ref={containerRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="lg:col-span-3 rounded-2xl border border-border bg-card relative overflow-hidden select-none cursor-grab active:cursor-grabbing flex flex-col"
        >
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground gap-3">
              <RefreshCw className="w-5 h-5 animate-spin text-primary" /> Loading graph relationships...
            </div>
          ) : nodes.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              No data to display. Form a group first!
            </div>
          ) : (
            <svg className="w-full h-full flex-1" onWheel={handleWheel}>
              <defs>
                {/* Glowing dropshadow filters */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="lightGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>

                {/* Node Linear Gradients */}
                <linearGradient id="groupGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d8b4fe" />
                  <stop offset="100%" stopColor="#7e22ce" />
                </linearGradient>
                <linearGradient id="personGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fed7aa" />
                  <stop offset="100%" stopColor="#c2410c" />
                </linearGradient>
                <linearGradient id="taskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a7f3d0" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="meetingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fecaca" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
              </defs>

              {/* Rendered Graph Workspace Canvas */}
              <g transform={`translate(${translateX}, ${translateY}) scale(${scale})`}>
                {/* 1. Edges / Connective Links */}
                {edges.map((edge, i) => {
                  const from = nodes.find((n) => n.id === edge.from);
                  const to = nodes.find((n) => n.id === edge.to);
                  if (!from || !to) return null;

                  const isHovered = hoveredNodeId === edge.from || hoveredNodeId === edge.to;
                  const isDimmed = hoveredNodeId && !isHovered;

                  const relColor = getRelationColor(edge.relation);

                  return (
                    <g key={i}>
                      {/* Interactive thick click area for edge */}
                      <line
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke="transparent"
                        strokeWidth={12}
                        className="cursor-pointer"
                      />
                      {/* Visible connection line */}
                      <line
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke={relColor}
                        strokeWidth={isHovered ? 3.5 : 2}
                        opacity={isDimmed ? 0.08 : isHovered ? 1.0 : 0.45}
                        strokeDasharray={edge.relation === "WORKS_ON" || edge.relation === "FORMED_IN" ? "6, 4" : undefined}
                        className="transition-all duration-300"
                        style={{
                          filter: isHovered ? "url(#lightGlow)" : undefined,
                        }}
                      >
                        {isHovered && (
                          <animate
                            attributeName="stroke-dashoffset"
                            values="30;0"
                            dur="1.2s"
                            repeatCount="indefinite"
                          />
                        )}
                      </line>

                      {/* Display relationship label in center of link when hovered */}
                      {isHovered && (
                        <g transform={`translate(${(from.x + to.x) / 2}, ${(from.y + to.y) / 2})`}>
                          <rect
                            x={-38}
                            y={-8}
                            width={76}
                            height={16}
                            rx={4}
                            fill="#1e1b4b"
                            stroke={relColor}
                            strokeWidth={1}
                            opacity={0.9}
                          />
                          <text
                            textAnchor="middle"
                            y={3}
                            className="fill-foreground text-[8px] font-bold tracking-wider select-none font-mono"
                          >
                            {edge.relation}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* 2. Nodes */}
                {nodes.map((node) => {
                  const style = typeStyles[node.type] || typeStyles.person;
                  const isHovered = hoveredNodeId === node.id;
                  const isNeighbor = activeRelationNodeIds.has(node.id);
                  const isDimmed = hoveredNodeId && !isHovered && !isNeighbor;
                  const isSelected = selectedNodeId === node.id;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                    >
                      {/* Ambient Node outer pulsing glow on hover / select */}
                      {(isHovered || isSelected) && (
                        <circle
                          r={style.size + 8}
                          fill={style.bg}
                          opacity={isSelected ? 0.25 : 0.15}
                          className="animate-ping"
                          style={{ animationDuration: "3s" }}
                        />
                      )}

                      {/* Core Node Circle */}
                      <circle
                        r={style.size}
                        fill={style.gradient}
                        stroke={isHovered || isSelected ? "#ffffff" : style.border}
                        strokeWidth={isHovered || isSelected ? 3 : 2}
                        opacity={isDimmed ? 0.2 : 1.0}
                        className="transition-all duration-200 hover:scale-105"
                        style={{
                          filter: isHovered || isSelected ? "url(#glow)" : undefined,
                        }}
                      />

                      {/* White Type-initial letter inside circle */}
                      <text
                        textAnchor="middle"
                        y={5}
                        className="fill-white text-[12px] font-extrabold select-none pointer-events-none"
                      >
                        {style.text}
                      </text>

                      {/* Node text Label */}
                      <g transform={`translate(0, ${style.size + 14})`}>
                        {/* Semi-transparent text background for high readability */}
                        <rect
                          x={-Math.min(75, node.label.length * 4.5 + 8) / 2}
                          y={-9}
                          width={Math.min(75, node.label.length * 4.5 + 8)}
                          height={15}
                          rx={4}
                          fill="#0f172a"
                          stroke={isHovered ? style.bg : "transparent"}
                          strokeWidth={1}
                          opacity={isDimmed ? 0.2 : 0.85}
                          className="transition-all duration-300"
                        />
                        <text
                          textAnchor="middle"
                          y={2}
                          className={`text-[9px] font-semibold select-none pointer-events-none transition-colors duration-300 ${
                            isHovered ? "fill-white" : "fill-slate-300"
                          }`}
                          opacity={isDimmed ? 0.25 : 1.0}
                          style={{ fontFamily: "var(--font-body)" }}
                        >
                          {node.label.length > 10 ? `${node.label.substring(0, 9)}...` : node.label}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>
            </svg>
          )}

          {/* Interactive Legend overlay inside Canvas */}
          <div className="absolute bottom-4 left-4 glass-panel rounded-2xl border border-border p-3.5 flex items-center gap-5 text-xs select-none shadow-xl">
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border border-orange-600 bg-orange-500 shadow-md shadow-orange-500/20" /> Person
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border border-purple-600 bg-purple-500 shadow-md shadow-purple-500/20" /> Group
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border border-emerald-600 bg-emerald-500 shadow-md shadow-emerald-500/20" /> Task
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border border-red-600 bg-red-400 shadow-md shadow-red-500/20" /> Meeting
            </span>
          </div>
        </div>

        {/* Selected Node Details side Drawer Panel */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl flex flex-col justify-between select-none">
          {selectedNodeInfo ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg"
                  style={{ backgroundColor: typeStyles[selectedNodeInfo.type]?.bg }}
                >
                  {typeStyles[selectedNodeInfo.type]?.text}
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    {typeStyles[selectedNodeInfo.type]?.label}
                  </span>
                  <h3 className="font-heading font-bold text-foreground text-base leading-tight break-all">
                    {selectedNodeInfo.label}
                  </h3>
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Node Identifier
                  </h4>
                  <p className="bg-background/60 border border-border p-2 rounded-lg text-xs font-mono break-all text-slate-300">
                    {selectedNodeInfo.id}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Connections Context
                  </h4>
                  <div className="space-y-2">
                    {edges.filter((e) => e.from === selectedNodeInfo.id || e.to === selectedNodeInfo.id).length === 0 ? (
                      <p className="text-xs text-muted-foreground">No active relationships.</p>
                    ) : (
                      edges
                        .filter((e) => e.from === selectedNodeInfo.id || e.to === selectedNodeInfo.id)
                        .map((edge, i) => {
                          const otherId = edge.from === selectedNodeInfo.id ? edge.to : edge.from;
                          const otherNode = nodes.find((n) => n.id === otherId);
                          return (
                            <div
                              key={i}
                              className="flex items-center justify-between p-2 rounded-lg bg-background/40 border border-border/50 text-[11px]"
                            >
                              <span className="text-slate-400 font-mono text-[9px] uppercase tracking-tight">
                                {edge.relation}
                              </span>
                              <span className="font-semibold text-slate-200">
                                {otherNode?.label || (otherId || "").substring(0, 8)}
                              </span>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground py-8">
              <Layers className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
              <p className="text-sm font-semibold">No Node Selected</p>
              <p className="text-xs text-slate-500 mt-1 max-w-[180px]">
                Click on any node in the graph to view active connection details
              </p>
            </div>
          )}

          <div className="text-[10px] text-muted-foreground text-center pt-4 border-t border-border mt-auto">
            💡 Drag nodes to custom space them. Scroll to zoom. Drag background to pan around.
          </div>
        </div>
      </div>
    </motion.div>
  );
}

