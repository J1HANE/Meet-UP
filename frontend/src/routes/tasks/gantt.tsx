// src/pages/GanttPage.tsx
import { useEffect, useState } from "react";
import { GanttChart } from "@/components/tasks-service/GanttChart";
import type { GanttData, GanttTask } from "@/types/task-service";
import { taskApi } from "@/lib/api/taskApi";
import { Loader2, GanttChartSquare } from "lucide-react";
import { motion } from "framer-motion";
import { TaskHeader } from "@/components/tasks-service/TaskHeader";
import { createFileRoute } from "@tanstack/react-router";
import { useSelectedMeeting } from "@/hooks/task-service/useSelectedMeeting";
import { NotReadyPage } from "@/components/tasks-service/NotReadPage";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/tasks/gantt")({
  component: GanttPage,
});

function GanttPage() {
  const [ganttData, setGanttData] = useState<GanttData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const { contextId, isReady } = useSelectedMeeting();

  useEffect(() => {
    if (contextId == null) return;
    const fetchGanttData = async () => {
      try {
        setLoading(true);
        const response = await taskApi.getGanttData(contextId);
        setGanttData(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to load Gantt chart data" + err);
      } finally {
        setLoading(false);
      }
    };

    fetchGanttData();
  }, [contextId]);

  const handleTaskClick = (task: GanttTask) => {
    console.log("Task clicked:", task);
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='flex flex-col items-center gap-3 text-muted-foreground'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
          <span className='text-sm'>Loading chart data…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='rounded-[2rem] border border-destructive/30 bg-destructive/10 px-8 py-10 text-center max-w-sm'>
          <p className='text-destructive font-medium'>{error}</p>
          <p className='text-sm text-muted-foreground mt-2'>
            Try refreshing the page or check your connection.
          </p>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <NotReadyPage
        userId={user?.id}
        userName={user?.displayName}
        title='No Meeting Selected'
        description='select a meeting from the dropdown above to see gantt diagram'
      />
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <TaskHeader userId={user?.id} userName={user?.displayName} />
      <div className='container mx-auto px-4 sm:px-6 py-6 space-y-5'>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex flex-wrap items-center justify-between gap-4'
        >
          <div>
            {ganttData && (
              <p className='mt-1 text-sm text-muted-foreground'>
                {ganttData.meta.totalTasks} tasks ·{" "}
                {ganttData.meta.overallProgressPercent}% overall progress
              </p>
            )}
          </div>
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 border border-primary/20'>
            <GanttChartSquare className='h-5 w-5 text-primary' />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          {ganttData && (
            <GanttChart data={ganttData} onTaskClick={handleTaskClick} />
          )}
        </motion.div>
      </div>
    </div>
  );
}
