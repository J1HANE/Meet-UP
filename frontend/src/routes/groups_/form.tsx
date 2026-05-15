import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "@/lib/api/groups";
import { ArrowLeft, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/groups_/form")({
  component: FormGroupPage,
});

function FormGroupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [taskId, setTaskId] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [ownerId, setOwnerId] = useState("");

  const formMutation = useMutation({
    mutationFn: () => groupsApi.formGroup(taskId, meetingId, ownerId),
    onSuccess: (newGroup) => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      navigate({ to: `/groups/${newGroup.id}` });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskId || !meetingId || !ownerId) return;
    formMutation.mutate();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto space-y-6 mt-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/groups">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Form New Group</h1>
          <p className="text-muted-foreground text-sm mt-1">Create a new collaborative tween group</p>
        </div>
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Task ID</label>
            <input
              type="text"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Enter Task ID"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Meeting ID</label>
            <input
              type="text"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Enter Meeting ID"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Owner ID</label>
            <input
              type="text"
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Enter Owner ID"
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link to="/groups">
              <Button variant="ghost" type="button">Cancel</Button>
            </Link>
            <Button type="submit" disabled={formMutation.isPending} className="gap-2">
              <Users className="w-4 h-4" /> 
              {formMutation.isPending ? "Forming..." : "Form Group"}
            </Button>
          </div>
          
          {formMutation.isError && (
            <div className="text-destructive text-sm mt-2">
              Failed to form group. Please try again.
            </div>
          )}
        </form>
      </div>
    </motion.div>
  );
}
