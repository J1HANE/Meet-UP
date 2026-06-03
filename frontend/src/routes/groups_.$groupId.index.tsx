import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsApi } from "@/lib/api/groups";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, UserMinus, UserPlus, ShieldAlert, GitFork, GitMerge, Trash2, Edit2, Check, X } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/groups_/$groupId/")({
  component: GroupDetailsPage,
});

function GroupDetailsPage() {
  const { groupId } = Route.useParams();
  const queryClient = useQueryClient();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");

  const { data: group, isLoading } = useQuery({
    queryKey: ["groups", groupId],
    queryFn: () => groupsApi.getGroupById(groupId),
  });

  const leaveMutation = useMutation({
    mutationFn: (personId: string) => groupsApi.leaveGroup(groupId, personId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["groups", groupId] }),
  });

  const dissolveMutation = useMutation({
    mutationFn: () => groupsApi.dissolveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      // Redirect or show message
    },
  });

  const updateNameMutation = useMutation({
    mutationFn: (name: string) => groupsApi.updateGroupName(groupId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups", groupId] });
      setIsEditingName(false);
    },
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading group details...</div>;
  if (!group) return <div className="p-8 text-center text-destructive">Group not found</div>;

  const taskName = group.task?.task?.title || group.name || group.taskId;
  const activeLeads = (group.leads || []).filter((lead) => !lead.toDate);

  const handleStartEdit = () => {
    setEditedName(group.name || "");
    setIsEditingName(true);
  };

  const handleSaveEdit = () => {
    if (editedName.trim()) {
      updateNameMutation.mutate(editedName.trim());
    }
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/groups">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div className="flex-1">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="text-2xl font-heading font-bold bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
              />
              <Button variant="ghost" size="icon" onClick={handleSaveEdit} disabled={updateNameMutation.isPending}>
                <Check className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-heading font-bold">{group.name || "Unnamed Group"}</h1>
              <Button variant="ghost" size="icon" onClick={handleStartEdit}>
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          )}
          <p className="text-muted-foreground text-sm">Task: {taskName}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-sm bg-secondary text-secondary-foreground font-medium">
            Status: {group.state}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Members
              </h2>
              <Link to={`/groups/${groupId}/add-member`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <UserPlus className="w-4 h-4" /> Add
                </Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {activeLeads.map((lead, i) => (
                <div key={`lead-${i}`} className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <div>
                    <p className="font-medium text-sm">{lead.person.name || lead.person.email || lead.person.id}</p>
                    <p className="text-xs text-muted-foreground">Role: Lead</p>
                  </div>
                </div>
              ))}
              {(group.members || []).filter(m => !m.leftAt).map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
                  <div>
                    <p className="font-medium text-sm">{m.person.name || m.person.email || m.person.id}</p>
                    <p className="text-xs text-muted-foreground">Role: {m.roleInGroup}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => leaveMutation.mutate(m.person.id)}>
                    <UserMinus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {activeLeads.length === 0 && (!group.members || group.members.filter(m => !m.leftAt).length === 0) && (
                <p className="text-sm text-muted-foreground">No active members.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-heading font-semibold flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-primary" /> Actions
            </h2>
            <div className="space-y-3">
              <Link to={`/groups/${groupId}/transfer`} className="block w-full">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Users className="w-4 h-4" /> Transfer Lead
                </Button>
              </Link>
              <Link to={`/groups/${groupId}/split`} className="block w-full">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <GitFork className="w-4 h-4" /> Split Group
                </Button>
              </Link>
              <Link to={`/groups/${groupId}/merge`} className="block w-full">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <GitMerge className="w-4 h-4" /> Merge Group
                </Button>
              </Link>
              <div className="pt-4 border-t border-border">
                <Button variant="destructive" className="w-full justify-start gap-2" onClick={() => dissolveMutation.mutate()}>
                  <Trash2 className="w-4 h-4" /> Dissolve Group
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
