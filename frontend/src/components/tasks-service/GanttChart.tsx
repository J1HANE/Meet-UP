import React, { useRef, useState, useCallback } from "react";
import type {
  GanttData,
  GanttTask,
  TaskDependency,
} from "@/types/task-service";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react";

interface GanttChartProps {
  data: GanttData;
  onTaskClick?: (task: GanttTask) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  data,
  onTaskClick,
  onTaskUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [scale, setScale] = useState(1);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipContent, setTooltipContent] = useState<GanttTask | null>(null);

  if (!data || !data.tasks || data.tasks.length === 0) {
    return (
      <div className='flex items-center justify-center h-64 rounded-[2rem] border border-border bg-card'>
        <div className='text-center'>
          <p className='text-muted-foreground'>
            No tasks available for Gantt chart
          </p>
          <p className='text-sm text-muted-foreground/60 mt-1'>
            Create tasks with start and end dates to visualize them here
          </p>
        </div>
      </div>
    );
  }

  // Chart dimensions
  const SIDEBAR_WIDTH = 280;
  const ROW_HEIGHT = 56;
  const HEADER_HEIGHT = 56;
  const BAR_HEIGHT = 24;
  const DAY_WIDTH = 52 * scale;

  const startDate = new Date(data.meta.projectStart);
  const endDate = new Date(data.meta.projectEnd);
  const totalDays = Math.max(
    1,
    Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    ),
  );

  const totalWidth = totalDays * DAY_WIDTH;
  const totalHeight = data.tasks.length * ROW_HEIGHT + HEADER_HEIGHT;

  const getTaskPosition = useCallback(
    (task: GanttTask) => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      const startOffset = Math.max(
        0,
        Math.floor(
          (taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        ),
      );
      const duration = Math.max(
        1,
        Math.ceil(
          (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24),
        ),
      );
      return {
        left: startOffset * DAY_WIDTH,
        width: duration * DAY_WIDTH,
        startOffset,
        duration,
      };
    },
    [startDate, DAY_WIDTH],
  );

  const getDependencyPath = useCallback(
    (
      fromTask: GanttTask,
      toTask: GanttTask,
      fromIndex: number,
      toIndex: number,
    ) => {
      const fromPos = getTaskPosition(fromTask);
      const toPos = getTaskPosition(toTask);

      const fromX = SIDEBAR_WIDTH + fromPos.left + fromPos.width;
      const fromY = fromIndex * ROW_HEIGHT + ROW_HEIGHT / 2;
      const toX = SIDEBAR_WIDTH + toPos.left;
      const toY = toIndex * ROW_HEIGHT + ROW_HEIGHT / 2;

      return `M ${fromX} ${fromY} C ${fromX + 32} ${fromY}, ${toX - 32} ${toY}, ${toX} ${toY}`;
    },
    [SIDEBAR_WIDTH, ROW_HEIGHT, getTaskPosition],
  );

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollLeft(e.currentTarget.scrollLeft);
  };

  const handleZoomIn = () =>
    setScale((prev) => Math.min(3, +(prev + 0.2).toFixed(1)));
  const handleZoomOut = () =>
    setScale((prev) => Math.max(0.4, +(prev - 0.2).toFixed(1)));
  const handleReset = () => {
    setScale(1);
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
      setScrollLeft(0);
    }
  };

  const STATUS_COLORS: Record<string, string> = {
    COMPLETED: "#1D9E75",
    IN_PROGRESS: "#378ADD",
    BLOCKED: "#E24B4A",
    IN_REVIEW: "#7F77DD",
    ASSIGNED: "#BA7517",
    CANCELLED: "#888780",
    TODO: "#B4B2A9",
  };

  const getStatusColor = (status: string) => STATUS_COLORS[status] ?? "#B4B2A9";

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  const handleMouseMove = (e: React.MouseEvent, task: GanttTask) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
    setTooltipContent(task);
  };

  const todayOffset = Math.floor(
    (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const showTodayLine = todayOffset >= 0 && todayOffset <= totalDays;

  return (
    <div className='rounded-[2rem] border border-border bg-card shadow-sm overflow-hidden'>
      {/* ── Toolbar ── */}
      <div className='border-b border-border px-4 py-2.5 bg-muted/20 flex items-center justify-between gap-4 flex-wrap'>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleZoomIn}
            className='gap-1.5 h-8 text-xs border-border bg-card text-foreground hover:bg-muted/40'
          >
            <ZoomIn className='h-3.5 w-3.5' /> Zoom in
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={handleZoomOut}
            className='gap-1.5 h-8 text-xs border-border bg-card text-foreground hover:bg-muted/40'
          >
            <ZoomOut className='h-3.5 w-3.5' /> Zoom out
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={handleReset}
            className='gap-1.5 h-8 text-xs border-border bg-card text-foreground hover:bg-muted/40'
          >
            <RefreshCw className='h-3.5 w-3.5' /> Reset
          </Button>
        </div>
        <div className='flex items-center gap-4 flex-wrap'>
          {[
            { color: "#378ADD", label: "In progress" },
            { color: "#1D9E75", label: "Completed" },
            { color: "#E24B4A", label: "Blocked" },
            { color: "#7F77DD", label: "In review" },
            { color: "#EF9F27", label: "Critical path" },
          ].map(({ color, label }) => (
            <div key={label} className='flex items-center gap-1.5'>
              <div
                className='w-2.5 h-2.5 rounded-full flex-shrink-0'
                style={{ background: color }}
              />
              <span className='text-xs text-muted-foreground'>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Chart ── */}
      <div
        ref={containerRef}
        className='overflow-auto relative'
        onScroll={handleScroll}
        style={{ maxHeight: 560 }}
      >
        <div
          style={{ width: SIDEBAR_WIDTH + totalWidth, position: "relative" }}
        >
          {/* Sticky header */}
          <div className='sticky top-0 z-20 border-b border-border flex'>
            {/* Sidebar header */}
            <div
              className='flex-shrink-0 flex items-end pb-2.5 px-4 border-r border-border bg-muted/30'
              style={{ width: SIDEBAR_WIDTH, height: HEADER_HEIGHT }}
            >
              <span className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                Task
              </span>
            </div>

            {/* Day columns */}
            <div className='flex bg-muted/20' style={{ width: totalWidth }}>
              {Array.from({ length: totalDays }).map((_, i) => {
                const d = new Date(startDate);
                d.setDate(d.getDate() + i);
                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                const isToday = d.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex-shrink-0 border-r border-border/50 text-center flex flex-col items-center justify-end pb-2",
                      isWeekend && "bg-muted/30",
                      isToday && "bg-primary/10",
                    )}
                    style={{ width: DAY_WIDTH, height: HEADER_HEIGHT }}
                  >
                    <span className='text-[10px] text-muted-foreground/60 leading-none mb-0.5'>
                      {d.toLocaleDateString("en-US", { weekday: "short" })}
                    </span>
                    <span
                      className={cn(
                        "text-sm leading-none",
                        isToday
                          ? "font-semibold text-primary"
                          : "text-foreground/80",
                      )}
                    >
                      {d.getDate()}
                    </span>
                    <span className='text-[10px] text-muted-foreground/60 leading-none mt-0.5'>
                      {d.toLocaleDateString("en-US", { month: "short" })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SVG dependency arrows */}
          <svg
            ref={svgRef}
            className='absolute left-0 pointer-events-none z-10'
            style={{
              top: HEADER_HEIGHT,
              width: SIDEBAR_WIDTH + totalWidth,
              height: totalHeight,
            }}
          >
            <defs>
              <marker
                id='arrowhead'
                markerWidth='8'
                markerHeight='6'
                refX='7'
                refY='3'
                orient='auto'
              >
                <polygon points='0 0, 8 3, 0 6' fill='hsl(var(--border))' />
              </marker>
            </defs>
            {data.dependencies.map((dep: TaskDependency, idx: number) => {
              const fromTask = data.tasks.find(
                (t) => t.taskId === dep.fromTaskId,
              );
              const toTask = data.tasks.find((t) => t.taskId === dep.toTaskId);
              const fromIdx = data.tasks.findIndex(
                (t) => t.taskId === dep.fromTaskId,
              );
              const toIdx = data.tasks.findIndex(
                (t) => t.taskId === dep.toTaskId,
              );
              if (!fromTask || !toTask || fromIdx < 0 || toIdx < 0) return null;
              return (
                <path
                  key={idx}
                  d={getDependencyPath(fromTask, toTask, fromIdx, toIdx)}
                  fill='none'
                  stroke='hsl(var(--border))'
                  strokeWidth='1.5'
                  strokeDasharray={
                    dep.type === "START_TO_START" ? "4,3" : undefined
                  }
                  markerEnd='url(#arrowhead)'
                />
              );
            })}
          </svg>

          {/* Today line */}
          {showTodayLine && (
            <div
              className='absolute z-10 pointer-events-none'
              style={{
                top: HEADER_HEIGHT,
                left: SIDEBAR_WIDTH + todayOffset * DAY_WIDTH,
                width: 1.5,
                height: data.tasks.length * ROW_HEIGHT,
                background: "hsl(var(--primary))",
                opacity: 0.45,
              }}
            />
          )}

          {/* Task rows */}
          <div className='relative'>
            {data.tasks.map((task, idx) => {
              const pos = getTaskPosition(task);
              const barColor = getStatusColor(task.status);
              const depthIndent = task.depth * 18;

              return (
                <div
                  key={task.taskId}
                  className='flex border-b border-border/40 hover:bg-muted/10 transition-colors cursor-pointer'
                  style={{ height: ROW_HEIGHT }}
                  onClick={() => onTaskClick?.(task)}
                  onMouseEnter={() => setHoveredTask(task.taskId)}
                  onMouseLeave={() => {
                    setHoveredTask(null);
                    setTooltipContent(null);
                  }}
                  onMouseMove={(e) => handleMouseMove(e, task)}
                >
                  {/* Sidebar cell */}
                  <div
                    className='flex-shrink-0 flex flex-col justify-center gap-1 border-r border-border/40 bg-card'
                    style={{
                      width: SIDEBAR_WIDTH,
                      paddingLeft: 16 + depthIndent,
                      paddingRight: 12,
                    }}
                  >
                    <div className='flex items-center gap-1.5 min-w-0'>
                      {task.isMilestone && (
                        <span className='text-amber-500 text-base leading-none'>
                          ◆
                        </span>
                      )}
                      <span
                        className={cn(
                          "text-sm font-medium truncate",
                          task.criticalPath
                            ? "text-destructive"
                            : "text-foreground",
                        )}
                      >
                        {task.taskName}
                      </span>
                    </div>
                    <div className='flex items-center gap-2'>
                      {task.assignedTo && (
                        <span className='text-xs text-muted-foreground'>
                          @{task.assignedTo}
                        </span>
                      )}
                      {task.categoryName && (
                        <div className='flex items-center gap-1'>
                          <div
                            className='w-1.5 h-1.5 rounded-full flex-shrink-0'
                            style={{
                              background:
                                task.categoryColor ??
                                "hsl(var(--muted-foreground))",
                            }}
                          />
                          <span className='text-xs text-muted-foreground'>
                            {task.categoryName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline cell */}
                  <div
                    className='relative flex-shrink-0'
                    style={{ width: totalWidth }}
                  >
                    {task.isMilestone ? (
                      <div
                        className='absolute'
                        style={{
                          left: pos.left + DAY_WIDTH / 2 - 9,
                          top: "50%",
                          marginTop: -9,
                          width: 18,
                          height: 18,
                          background: "#EF9F27",
                          transform: "rotate(45deg)",
                          borderRadius: 2,
                        }}
                      />
                    ) : (
                      <div
                        className={cn(
                          "absolute rounded-md overflow-hidden",
                          task.criticalPath &&
                            "ring-2 ring-amber-400 ring-offset-0",
                        )}
                        style={{
                          left: pos.left,
                          width: Math.max(pos.width, 28),
                          top: "50%",
                          height: BAR_HEIGHT,
                          marginTop: -(BAR_HEIGHT / 2),
                          background: barColor,
                          opacity: task.status === "CANCELLED" ? 0.5 : 1,
                        }}
                      >
                        <div
                          className='absolute inset-0 bg-black/20'
                          style={{ width: `${task.progressPercent}%` }}
                        />
                        {task.progressPercent > 0 && (
                          <div className='absolute inset-0 flex items-center justify-center'>
                            <span className='text-[11px] font-medium text-white/90 pointer-events-none'>
                              {task.progressPercent}%
                            </span>
                          </div>
                        )}
                        {onTaskUpdate && (
                          <>
                            <div
                              className='absolute left-0 top-0 w-1.5 h-full cursor-ew-resize hover:bg-white/25'
                              draggable
                              onDragStart={(e) =>
                                e.dataTransfer.setData(
                                  "text/plain",
                                  JSON.stringify({
                                    type: "resize-start",
                                    taskId: task.taskId,
                                  }),
                                )
                              }
                            />
                            <div
                              className='absolute right-0 top-0 w-1.5 h-full cursor-ew-resize hover:bg-white/25'
                              draggable
                              onDragStart={(e) =>
                                e.dataTransfer.setData(
                                  "text/plain",
                                  JSON.stringify({
                                    type: "resize-end",
                                    taskId: task.taskId,
                                  }),
                                )
                              }
                            />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tooltip ── */}
      {tooltipContent && hoveredTask && (
        <div
          className='fixed z-50 bg-card border border-border text-foreground text-xs rounded-xl py-2.5 px-3 pointer-events-none shadow-lg min-w-[170px]'
          style={{
            left: tooltipPosition.x + 14,
            top: tooltipPosition.y - 10,
          }}
        >
          <p className='font-semibold text-sm mb-1.5 border-b border-border pb-1.5 text-foreground'>
            {tooltipContent.taskName}
          </p>
          <div className='space-y-1'>
            {[
              ["Status", tooltipContent.status.replace("_", " ")],
              ["Progress", `${tooltipContent.progressPercent}%`],
              ["Start", formatDate(tooltipContent.startDate)],
              ["End", formatDate(tooltipContent.endDate)],
            ].map(([k, v]) => (
              <div key={k} className='flex justify-between gap-4'>
                <span className='text-muted-foreground'>{k}</span>
                <span className='text-foreground'>{v}</span>
              </div>
            ))}
            {tooltipContent.criticalPath && (
              <p className='text-amber-400 mt-1'>● Critical path</p>
            )}
          </div>
        </div>
      )}

      {/* ── Footer summary ── */}
      <div className='border-t border-border px-5 py-3.5 bg-muted/20 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4'>
        {[
          { label: "Total tasks", value: data.meta.totalTasks, cls: "" },
          {
            label: "Completed",
            value: data.meta.completedTasks,
            cls: "text-[#1D9E75]",
          },
          {
            label: "Overdue",
            value: data.meta.overdueTasks,
            cls: "text-destructive",
          },
          {
            label: "Milestones",
            value: data.meta.milestoneTasks,
            cls: "text-amber-500",
          },
          {
            label: "Overall progress",
            value: `${data.meta.overallProgressPercent}%`,
            cls: "",
          },
          {
            label: "Timeline",
            value: `${formatDate(data.meta.projectStart)} – ${formatDate(data.meta.projectEnd)}`,
            cls: "text-xs",
          },
        ].map(({ label, value, cls }) => (
          <div key={label}>
            <p className='text-[11px] text-muted-foreground uppercase tracking-wide mb-0.5'>
              {label}
            </p>
            <p
              className={cn(
                "font-semibold text-xl leading-tight text-foreground",
                cls,
              )}
            >
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
