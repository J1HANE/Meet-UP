import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "@/lib/api/groups";
import { ArrowLeft, GitFork } from "lucide-react";

export const Route = createFileRoute("/groups_/$groupId/split")({
  component: SplitGroupPage,
});

function SplitGroupPage() {
  const { groupId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newGroupName, setNewGroupName] = useState("");

  const splitMutation = useMutation({
    mutationFn: () => groupsApi.splitGroup(groupId, newGroupName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      navigate({ to: `/groups/${groupId}` });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName) return;
    splitMutation.mutate();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto space-y-6 mt-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to={`/groups/${groupId}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Split Group</h1>
          <p className="text-muted-foreground text-sm mt-1">Split current group into a new one</p>
        </div>
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">New Group Name</label>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Enter New Group Name"
              required
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link to={`/groups/${groupId}`}>
              <Button variant="ghost" type="button">Cancel</Button>
            </Link>
            <Button type="submit" disabled={splitMutation.isPending} className="gap-2">
              <GitFork className="w-4 h-4" /> 
              {splitMutation.isPending ? "Splitting..." : "Split Group"}
            </Button>
          </div>
          
          {splitMutation.isError && (
            <div className="text-destructive text-sm mt-2">
              Failed to split group. Please try again.
            </div>
          )}
        </form>
      </div>
    </motion.div>
  );
}
