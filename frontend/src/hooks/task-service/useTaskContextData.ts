import { useEffect } from "react";
import { useTaskStore } from "@/store/taskStore";
import { useSelectedMeeting } from "./useSelectedMeeting";

interface UseProjectDataOptions {
  withGantt?: boolean;
  withStats?: boolean;
}

export const useTaskContextData = (options: UseProjectDataOptions = {}) => {
  const { withGantt = false, withStats = false } = options;
  const { contextId, meetingName, isReady } = useSelectedMeeting();

  const {
    fetchTasks,
    fetchTags,
    fetchCategories,
    fetchGanttData,
    fetchTaskStats,
  } = useTaskStore();

  useEffect(() => {
    if (!isReady || !contextId) return;
    fetchTasks(contextId);
    fetchTags(contextId);
    fetchCategories(contextId);
    if (withGantt) fetchGanttData(contextId);
    if (withStats) fetchTaskStats(contextId);
  }, [
    contextId,
    isReady,
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
