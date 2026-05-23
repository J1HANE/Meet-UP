import { useEffect } from "react";
import { useTaskStore } from "@/store/taskStore";

const contextId = "project-123";
const meetingName = "Project Alpha";

interface UseProjectDataOptions {
  withGantt?: boolean;
  withStats?: boolean;
}

export const useTaskContextData = (options: UseProjectDataOptions = {}) => {
  const { withGantt = false, withStats = false } = options;

  const {
    fetchTasks,
    fetchTags,
    fetchCategories,
    fetchGanttData,
    fetchTaskStats,
  } = useTaskStore();

  useEffect(() => {
    fetchTasks(contextId);
    fetchTags(contextId);
    fetchCategories();
    if (withGantt) fetchGanttData(contextId);
    if (withStats) fetchTaskStats(contextId);
  }, [
    fetchCategories,
    fetchTags,
    fetchTasks,
    fetchGanttData,
    fetchTaskStats,
    withGantt,
    withStats,
  ]);

  return { contextId, meetingName };
};
