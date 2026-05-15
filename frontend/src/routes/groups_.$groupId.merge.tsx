import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "@/lib/api/groups";
import { ArrowLeft, GitMerge } from "lucide-react";

export const Route = createFileRoute("/groups_/$groupId/merge")({
  component: MergeGroupPage,
});

function MergeGroupPage() {
  const { groupId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sourceGroupId, setSourceGroupId] = useState("");

  const { data: groups = [] } = useQuery({
    queryKey: ["groups"],
    queryFn: groupsApi.getAllGroups,
  });

  const mergeMutation = useMutation({
    mutationFn: () => groupsApi.mergeGroups(groupId, sourceGroupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      navigate({ to: `/groups/${groupId}` });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceGroupId) return;
    mergeMutation.mutate();
  };

  const otherGroups = groups.filter(g => g.id !== groupId && g.state !== 'DISSOLVED');

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl mx-auto space-y-6 mt-8">
      <div className="flex items-center gap-4 mb-8">
        <Link to={`/groups/${groupId}`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Merge Group</h1>
          <p className="text-muted-foreground text-sm mt-1">Merge another group into this one</p>
        </div>
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Select Group to Merge (Source)</label>
            <select
              value={sourceGroupId}
              onChange={(e) => setSourceGroupId(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            >
              <option value="" disabled>Select a group...</option>
              {otherGroups.map(g => (
                <option key={g.id} value={g.id}>{g.name || g.id}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link to={`/groups/${groupId}`}>
              <Button variant="ghost" type="button">Cancel</Button>
            </Link>
            <Button type="submit" disabled={mergeMutation.isPending || !sourceGroupId} className="gap-2">
              <GitMerge className="w-4 h-4" /> 
              {mergeMutation.isPending ? "Merging..." : "Merge Group"}
            </Button>
          </div>
          
          {mergeMutation.isError && (
            <div className="text-destructive text-sm mt-2">
              Failed to merge groups. Please try again.
            </div>
          )}
        </form>
      </div>
    </motion.div>
  );
}
