import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Users, Crown, ListTodo, Calendar, UserMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { groupsApi, GroupNode, PersonNode, Leads } from "@/lib/api/groups";
import { useAuth } from "@/hooks/useAuth";
import { taskApi } from "@/lib/api/taskApi";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/activity")({
  component: ActivityPage,
  head: () => ({
    meta: [
      { title: "Activity — MeetFlow" },
      { name: "description", content: "View your group activities and task assignments" },
    ],
  }),
});

function ActivityPage() {
  const { user } = useAuth();
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [groupToLeave, setGroupToLeave] = useState<GroupNode | null>(null);

  const { data: allGroups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: groupsApi.getAllGroups,
  });

  // Filter groups where current user is a member OR a lead
  const userGroups = allGroups.filter((group) => {
    const isMember = group.members?.some((member) => member.person.id === user?.id);
    const isLead = group.leads?.some((lead) => lead.person.id === user?.id && !lead.toDate);
    return isMember || isLead;
  });

  // Extract unique meeting IDs from user groups
  const meetingIds = [...new Set(userGroups.map((group) => group.meeting?.meeting?.id).filter(Boolean))];

  // Fetch tasks for each unique meeting context
  const { data: tasksResponses, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", "multiple", meetingIds],
    queryFn: async () => {
      if (meetingIds.length === 0) return [];
      const tasksPromises = meetingIds.map((meetingId) => 
        taskApi.getAll(meetingId).catch(() => ({ data: [] }))
      );
      const responses = await Promise.all(tasksPromises);
      return responses.flatMap((response) => response.data || []);
    },
    enabled: meetingIds.length > 0,
  });

  const tasks = tasksResponses || [];

  const handleLeaveGroup = async (groupId: string) => {
    if (!user?.id) return;
    try {
      await groupsApi.leaveGroup(groupId, user.id);
      // Refetch groups to update the list
      window.location.reload();
    } catch (error) {
      console.error("Failed to leave group:", error);
    }
  };

  const openLeaveDialog = (group: GroupNode) => {
    setGroupToLeave(group);
    setLeaveDialogOpen(true);
  };

  const getTeamLead = (group: GroupNode): Leads | undefined => {
    return group.leads?.find((lead) => !lead.toDate);
  };

  const getTaskById = (taskId: string) => {
    return tasks.find((task) => task.taskId === taskId);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Activity</h1>
        <p className="text-muted-foreground text-sm mt-1">
          View your group memberships and associated tasks
        </p>
      </div>

      {groupsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : userGroups.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>You're not part of any groups yet.</p>
          <p className="text-sm mt-2">Join a group to see your activity here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {userGroups.map((group, i) => {
            const teamLead = getTeamLead(group);
            const task = getTaskById(group.taskId);
            
            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -2 }}
              >
                <Card className="border-border hover:border-primary/20 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl gradient-surface flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {group.name || "Unnamed Group"}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={`mt-1 ${
                              group.state === "ACTIVE"
                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                : group.state === "FORMING"
                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            }`}
                          >
                            {group.state}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Team Lead */}
                    {teamLead && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Team Lead</p>
                          <p className="text-sm font-medium">
                            {teamLead.person.name || teamLead.person.email || "Unknown"}
                          </p>
                        </div>
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {(teamLead.person.name || teamLead.person.id || "TL")
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}

                    {/* Task Information */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <ListTodo className="w-4 h-4 text-primary" />
                        <span className="font-medium">Associated Task</span>
                      </div>
                      {task ? (
                        <div className="p-3 rounded-lg bg-secondary/50 space-y-2">
                          <p className="text-sm font-medium">{task.taskName}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Start: {formatDate(task.baselineStart)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>End: {formatDate(task.baselineEnd)}</span>
                            </div>
                          </div>
                          {task.progressPercent !== undefined && (
                            <div className="w-full bg-secondary rounded-full h-2 mt-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${task.progressPercent}%` }}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg bg-secondary/50 text-sm text-muted-foreground">
                          Task details not available
                        </div>
                      )}
                    </div>

                    {/* Members */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Members ({group.members?.length || 0})
                      </p>
                      <div className="flex -space-x-2">
                        {(group.members || [])
                          .filter((m) => m.person)
                          .slice(0, 5)
                          .map((member, j) => (
                            <Avatar
                              key={j}
                              className="w-8 h-8 border-2 border-card"
                              title={
                                member.person.name ||
                                member.person.email ||
                                member.person.id
                              }
                            >
                              <AvatarFallback className="text-xs">
                                {(
                                  member.person.name ||
                                  member.person.id ||
                                  "U"
                                )
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        {(group.members?.length || 0) > 5 && (
                          <div className="w-8 h-8 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-xs font-bold text-secondary-foreground">
                            +{(group.members?.length || 0) - 5}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Leave Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => openLeaveDialog(group)}
                    >
                      <UserMinus className="w-4 h-4" />
                      Leave Group
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Leave Group Confirmation Dialog */}
      <AlertDialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave "{groupToLeave?.name || "this group"}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (groupToLeave) {
                  handleLeaveGroup(groupToLeave.id);
                }
                setLeaveDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
