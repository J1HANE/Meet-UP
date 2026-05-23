import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/meeting-context")({
  component: MeetingContextPage,
});

function MeetingContextPage() {
  const { user, isAuthenticated } = useAuth();
  const [meetingId, setMeetingId] = useState("");
  const [status, setStatus] = useState("LIVE");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!user) {
      toast.error("Not authenticated");
      return;
    }
    if (!meetingId) {
      toast.error("Meeting ID is required");
      return;
    }

    setLoading(true);
    try {
      await api.createMeetingContext(user, {
        meetingId,
        participantIds: user.tweenIds ?? [],
        tweenGroupIds: user.tweenIds ?? [],
        status,
      });
      toast.success("Meeting context created successfully");
      setMeetingId("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create context");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create Meeting Context</h1>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LIVE">LIVE</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? "Creating..." : "Create Context"}
          </button>
        </div>
      </div>
    </div>
  );
}
