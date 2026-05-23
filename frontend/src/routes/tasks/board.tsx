// src/pages/TaskBoardPage.tsx
import React, { useState } from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";
import { TaskElement } from "@/components/tasks-service/TaskElement";
import type { Task } from "@/types/task-service";
import { useTaskStore } from "@/store/taskStore";
import { BOARD_COLUMNS, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { TaskHeader } from "@/components/tasks-service/TaskHeader";
import { DroppableColumn } from "@/components/tasks-service/DroppableColumn";
import { useTaskContextData } from "@/hooks/task-service/useTaskContextData";
import { createFileRoute } from "@tanstack/react-router";

// Status → primary color used for the column accent dot
const COLUMN_ACCENT: Record<string, string> = {
  IN_BACKLOG: "bg-muted-foreground/40",
  ASSIGNED: "bg-[#BA7517]",
  IN_PROGRESS: "bg-[#378ADD]",
  BLOCKED: "bg-destructive",
  IN_REVIEW: "bg-[#7F77DD]",
  COMPLETED: "bg-[#1D9E75]",
  CANCELLED: "bg-muted-foreground/40",
};

export const Route = createFileRoute("/tasks/board")({
  component: TaskBoardPage,
});

function TaskBoardPage() {
  const { tasks, updateTaskStatus } = useTaskStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const { contextId, meetingName } = useTaskContextData();

  const getTasksByStatus = (status: string) =>
    tasks.filter((task) => task.status === status);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.taskId === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const taskId = active.id as string;
      const newStatus = over.id as Task["status"];
      if (BOARD_COLUMNS.some((col) => col.id === newStatus)) {
        updateTaskStatus(contextId, taskId, newStatus);
      }
    }
    setActiveTask(null);
  };

  return (
    <div className='min-h-screen bg-background'>
      <TaskHeader contextName={meetingName} />
      <div className='container mx-auto px-4 sm:px-6 py-6 space-y-5'>
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex flex-wrap items-center justify-between gap-4'
        >
          <div>
            <p className='mt-1 text-sm text-muted-foreground'>
              {tasks.length} total task{tasks.length !== 1 ? "s" : ""} across{" "}
              {BOARD_COLUMNS.length} columns
            </p>
          </div>
        </motion.div>

        {/* Board */}
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Horizontal scroll wrapper on mobile; grid on wider screens */}
          <div className='overflow-x-auto pb-4'>
            <div className='flex gap-3 min-w-max lg:min-w-0 lg:grid lg:grid-cols-3 xl:grid-cols-6'>
              {BOARD_COLUMNS.map((column, idx) => {
                const columnTasks = getTasksByStatus(column.id);
                const accentClass = COLUMN_ACCENT[column.id] ?? "bg-primary";

                return (
                  <motion.div
                    key={column.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    id={column.id}
                    className={cn(
                      "w-64 lg:w-auto flex-shrink-0 rounded-[1.5rem] border border-border bg-card",
                      "flex flex-col min-h-[500px]",
                    )}
                  >
                    {/* Column header */}
                    <div className='flex items-center gap-2 px-4 pt-4 pb-3 border-b border-border/50'>
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          accentClass,
                        )}
                      />
                      <span className='font-heading text-sm font-semibold text-foreground flex-1 truncate'>
                        {column.title}
                      </span>
                      <span className='text-xs font-medium text-muted-foreground bg-muted/40 border border-border/50 rounded-full px-2 py-0.5 min-w-[1.5rem] text-center'>
                        {columnTasks.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <DroppableColumn
                      id={column.id}
                      className='flex-1 p-3 space-y-2.5 overflow-y-auto'
                    >
                      {columnTasks.map((task) => (
                        <TaskElement key={task.taskId} task={task} />
                      ))}
                      {columnTasks.length === 0 && (
                        <div className='flex items-center justify-center h-24 rounded-xl border border-dashed border-border/50 text-xs text-muted-foreground/60'>
                          Drop tasks here
                        </div>
                      )}
                    </DroppableColumn>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <DragOverlay>
            {activeTask && <TaskElement task={activeTask} />}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
