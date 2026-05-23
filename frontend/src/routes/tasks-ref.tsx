import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/tasks-ref")({
  component: TasksRefPage,
});

function TasksRefPage() {
  const { user, isAuthenticated } = useAuth();
  const [meetingId, setMeetingId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!meetingId || !taskId) {
      toast.error("Meeting ID and Task ID are required");
      return;
    }

    setLoading(true);
    try {
      await api.addTaskReference(user, meetingId, taskId);
      toast.success("Task reference added successfully");
      setTaskId("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add task reference");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add Task Reference</h1>
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meeting ID</label>
            <input
              type="text"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter meeting ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Task ID</label>
            <input
              type="text"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter task ID"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? "Adding..." : "Add Task Reference"}
          </button>
        </div>
      </div>
    </div>
  );
}
