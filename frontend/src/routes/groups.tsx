import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Users, GitFork, GitMerge, ListTodo, Network, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { groupsApi } from "@/lib/api/groups";

export const Route = createFileRoute("/groups")({
  component: GroupsPage,
  head: () => ({
    meta: [
      { title: "Groups — MeetFlow" },
      { name: "description", content: "Manage your collaborative groups" },
    ],
  }),
});

function GroupsPage() {
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: groupsApi.getAllGroups,
  });
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Groups</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your collaborative groups (tweens)</p>
      </div>

      <div className="flex justify-end">
        <Button variant="default" className="gap-2">
          <Plus className="w-4 h-4" /> Form New Group
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading groups...</div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
          No groups found. Form a new group to start collaborating!
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((g, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -2 }}
            className="rounded-2xl border border-border bg-card p-5 space-y-4 hover:border-primary/20 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-surface flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-foreground">{g.name || "Unnamed Group"}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                g.state === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 
                g.state === 'FORMING' ? 'bg-blue-500/10 text-blue-500' : 
                'bg-yellow-500/10 text-yellow-500'
              }`}>
                {g.state}
              </span>
            </div>

            <div className="flex -space-x-2">
              {(g.members || []).map((m, j) => (
                <div key={j} className="w-8 h-8 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-xs font-bold text-secondary-foreground" title={m.person.id}>
                  {(m.person.name || m.person.id).substring(0, 2).toUpperCase()}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><ListTodo className="w-3.5 h-3.5" /> Task: {g.taskId || "None"}</span>
            </div>

            <div className="flex gap-2">
              <Link to={`/groups/$groupId`} params={{ groupId: g.id }}>
                <Button variant="outline" size="sm">View Details</Button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
      )}
    </motion.div>
  );
}
