// src/hooks/useTaskActions.ts
import { useTaskStore } from "@/store/taskStore";
import { ToastManager } from "@/lib/toastUtils";
import type { Task } from "@/types/task-service";
import { useSelectedMeeting } from "./useSelectedMeeting";

export const useTaskActions = () => {
  const {
    updateTask,
    updateTaskStatus,
    updateTaskPoints,
    updateName,
    updateTaskPriority,
    updateTaskVisibility,
    updateTaskProgress,
    assignTask,
    unassignTask,
    updateTaskReviewer,
    toggleTaskMilestone,
    setTaskMilestone,
    updateTaskRecurrence,
    updateTaskDates,
    updateTaskHours,
    updateTaskCategory,
    toggleTaskRequiresReview,
    addTagToTask,
    removeTaskTag,
  } = useTaskStore();

  const { contextId } = useSelectedMeeting();

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    if (contextId == null) return;
    ToastManager.updateTask(updateTask(contextId, taskId, updates));
  };

  const handleUpdateTaskField = async (
    taskId: string,
    field: string,
    value: any,
  ) => {
    const run = (promise: Promise<any>, successMsg: string) => {
      ToastManager.promise(promise, {
        pending: "Updating task...",
        success: successMsg,
        error: "Failed to update task.",
      });
    };

    if (contextId == null) return;
    switch (field) {
      case "status":
        return run(
          updateTaskStatus(contextId, taskId, value),
          `Status set to ${value.toLowerCase().replace("_", " ")}.`,
        );

      case "points":
        return run(
          updateTaskPoints(contextId, taskId, value),
          `Points updated to ${value}.`,
        );

      case "taskName":
        return run(
          updateName(contextId, taskId, value),
          `Name updated to ${value}.`,
        );

      case "priority":
        return run(
          updateTaskPriority(contextId, taskId, value),
          `Priority set to ${value.toLowerCase()}.`,
        );

      case "visibility":
        return run(
          updateTaskVisibility(contextId, taskId, value),
          `Visibility set to ${value.toLowerCase()}.`,
        );

      case "progress":
        return run(
          updateTaskProgress(contextId, taskId, value),
          `Progress updated to ${value}%.`,
        );

      case "assign":
        return run(
          assignTask(contextId, taskId, value.assignedTo, value.assignedToType),
          `Task assigned to ${value.assignedTo}.`,
        );

      case "unassign":
        return run(unassignTask(contextId, taskId), "Task unassigned.");

      case "reviewer":
        return run(
          updateTaskReviewer(contextId, taskId, value),
          "Reviewer updated.",
        );

      case "toggleMilestone":
        return run(
          toggleTaskMilestone(contextId, taskId),
          "Milestone toggled.",
        );

      case "setMilestone":
        return run(
          setTaskMilestone(contextId, taskId, value),
          "Milestone set.",
        );

      case "recurrence":
        return run(
          updateTaskRecurrence(contextId, taskId, value),
          "Recurrence updated.",
        );

      case "dates":
        return run(updateTaskDates(contextId, taskId, value), "Dates updated.");

      case "hours":
        return run(updateTaskHours(contextId, taskId, value), "Hours updated.");

      case "category":
        return run(
          updateTaskCategory(contextId, taskId, value),
          "Category updated.",
        );

      case "toggleRequiresReview":
        return run(
          toggleTaskRequiresReview(contextId, taskId),
          "Review requirement toggled.",
        );

      case "addTag":
        return run(
          addTagToTask(contextId, taskId, value),
          `Tag "${value}" added.`,
        );

      case "removeTag":
        return run(
          removeTaskTag(contextId, taskId, value),
          `Tag "${value}" removed.`,
        );

      default:
        return run(
          updateTask(contextId, taskId, { [field]: value }),
          "Task updated.",
        );
    }
  };

  return { handleUpdateTask, handleUpdateTaskField };
};
