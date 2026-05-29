import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "@/lib/api/groups";
import { ArrowLeft, Users } from "lucide-react";

export const Route = createFileRoute("/groups_/$groupId/transfer")({
  component: TransferLeadPage,
});

function TransferLeadPage() {
  const { groupId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newLeadId, setNewLeadId] = useState("");

  const { data: group } = useQuery({
    queryKey: ["groups", groupId],
    queryFn: () => groupsApi.getGroupById(groupId),
  });

  const activeLead = group?.leads?.find((lead) => !lead.toDate);
  const currentLead = activeLead?.person?.id || "";
  const currentLeadName = activeLead?.person?.name || activeLead?.person?.email || currentLead;

  const transferMutation = useMutation({
    mutationFn: () => groupsApi.transferLead(groupId, currentLead, newLeadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      navigate({ to: `/groups/${groupId}` });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadId || !currentLead) return;
    transferMutation.mutate();
  };

  const activeMembers = group?.members?.filter(m => !m.leftAt && m.person?.id !== currentLead) || [];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto space-y-6 mt-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to={`/groups/${groupId}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Transfer Lead</h1>
          <p className="text-muted-foreground text-sm mt-1">Transfer group leadership to another member</p>
        </div>
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Current Lead</label>
            <div className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground">
              {currentLeadName || "No active lead found"}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select New Lead</label>
            <select
              value={newLeadId}
              onChange={(e) => setNewLeadId(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={!currentLead || activeMembers.length === 0}
              required
            >
              <option value="" disabled>{activeMembers.length === 0 ? "No eligible members available" : "Select a member..."}</option>
              {activeMembers.map(m => (
                <option key={m.person.id} value={m.person.id}>{m.person.name || m.person.email || m.person.id}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link to={`/groups/${groupId}`}>
              <Button variant="ghost" type="button">Cancel</Button>
            </Link>
            <Button type="submit" disabled={transferMutation.isPending || !newLeadId || !currentLead} className="gap-2">
              <Users className="w-4 h-4" /> 
              {transferMutation.isPending ? "Transferring..." : "Transfer Lead"}
            </Button>
          </div>
          
          {transferMutation.isError && (
            <div className="text-destructive text-sm mt-2">
              Failed to transfer lead. Please try again.
            </div>
          )}
        </form>
      </div>
    </motion.div>
  );
}
