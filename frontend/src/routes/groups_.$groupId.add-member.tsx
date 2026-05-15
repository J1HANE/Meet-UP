import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "@/lib/api/groups";
import { ArrowLeft, UserPlus } from "lucide-react";

export const Route = createFileRoute("/groups_/$groupId/add-member")({
  component: AddMemberPage,
});

function AddMemberPage() {
  const { groupId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [personId, setPersonId] = useState("");
  const [role, setRole] = useState("MEMBER");

  const joinMutation = useMutation({
    mutationFn: () => groupsApi.joinGroup(groupId, personId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", groupId] });
      navigate({ to: `/groups/${groupId}` });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personId) return;
    joinMutation.mutate();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto space-y-6 mt-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to={`/groups/${groupId}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Add Member</h1>
          <p className="text-muted-foreground text-sm mt-1">Add a new member to the group</p>
        </div>
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Person ID</label>
            <input
              type="text"
              value={personId}
              onChange={(e) => setPersonId(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Enter User/Person ID"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            >
              <option value="MEMBER">Member</option>
              <option value="OBSERVER">Observer</option>
              <option value="EXPERT">Expert</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link to={`/groups/${groupId}`}>
              <Button variant="ghost" type="button">Cancel</Button>
            </Link>
            <Button type="submit" disabled={joinMutation.isPending} className="gap-2">
              <UserPlus className="w-4 h-4" /> 
              {joinMutation.isPending ? "Adding..." : "Add Member"}
            </Button>
          </div>
          
          {joinMutation.isError && (
            <div className="text-destructive text-sm mt-2">
              Failed to add member. Please try again.
            </div>
          )}
        </form>
      </div>
    </motion.div>
  );
}
