import React, { useEffect, useState } from "react";
import type {
  Task,
  Tag,
  Category,
  AssignedToType,
  Participant,
  DependencyType,
} from "@/types/task-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  User,
  Users,
  Globe,
  Lock,
  CheckCircle,
  XCircle,
  Plus,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { cn, statusColors } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTaskStore } from "@/store/taskStore";
import { DependencyRow } from "./DependencyRow";
import { useTaskContextData } from "@/hooks/task-service/useTaskContextData";

interface TaskDetailsModalProps {
  task: Task;
  open: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onUpdateField?: (taskId: string, field: string, value: any) => void;
  tags: Tag[];
  categories: Category[];
  allTasks: Task[];
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  open,
  onClose,
  onUpdate,
  onUpdateField,
  categories,
  tags,
  allTasks,
}) => {
  const [activeTab, setActiveTab] = useState("general");
  const [selectedDependency, setSelectedDependency] = useState("");
  const [selectedDependencyType, setSelectedDependencyType] =
    useState<DependencyType>("FINISH_TO_START");
  const [selectedTag, setSelectedTag] = useState("");

  const [lagDays, setLagDays] = useState(0);

  const { contextId } = useTaskContextData();

  const {
    dependencies,
    dependenciesLoading,
    fetchDependencies,
    updateDependency,
    createDependency,
    deleteDependency,
  } = useTaskStore();

  useEffect(() => {
    if (activeTab === "dependencies") {
      fetchDependencies(contextId, task.taskId);
    }
  }, [activeTab, task.taskId, contextId, fetchDependencies]);

  const handleUpdateField = (field: string, value: any) => {
    if (onUpdateField) {
      onUpdateField(task.taskId, field, value);
    } else {
      // Fallback to generic update if specific patch handler not provided
      onUpdate(task.taskId, { [field]: value });
    }
  };

  const handleAddDependency = async () => {
    if (!selectedDependency) return;
    await createDependency(contextId, task.taskId, {
      dependsOnTaskId: selectedDependency,
      dependencyType: selectedDependencyType,
      lagDays,
    });
    setSelectedDependency("");
    setSelectedDependencyType("FINISH_TO_START");
    setLagDays(0);
  };

  const handleRemoveDependency = async (dependsOnTaskId: string) => {
    await deleteDependency(contextId, task.taskId, dependsOnTaskId);
  };

  const handleAddTag = () => {
    if (selectedTag) {
      handleUpdateField("addTag", selectedTag);
      setSelectedTag("");
    }
  };

  const handleRemoveTag = (tagId: string) => {
    handleUpdateField("removeTag", tagId);
  };

  const handleVisibilityChange = (visibility: Task["visibility"]) => {
    handleUpdateField("visibility", visibility);
  };

  const handleStatusChange = (status: Task["status"]) => {
    handleUpdateField("status", status);
  };

  const handlePriorityChange = (priority: Task["priority"]) => {
    handleUpdateField("priority", priority);
  };

  const handlePointsChange = (points: number) => {
    handleUpdateField("points", points);
  };

  const handleProgressChange = (progress: number) => {
    handleUpdateField("progress", progress);
  };

  const handleMilestoneToggle = () => {
    handleUpdateField("toggleMilestone", undefined);
  };

  const handleRequiresReviewToggle = () => {
    handleUpdateField("toggleRequiresReview", undefined);
  };

  const handleRecurrenceChange = (interval: string) => {
    handleUpdateField("recurrence", interval === "none" ? undefined : interval);
  };

  const handleAssigneeChange = (
    assignedTo: string,
    assignedToType: AssignedToType,
  ) => {
    handleUpdateField("assign", { assignedTo, assignedToType });
  };

  const handleReviewerChange = (reviewedBy: string) => {
    handleUpdateField("reviewer", reviewedBy);
  };

  const handleCategoryChange = (categoryId: string) => {
    handleUpdateField(
      "category",
      categoryId === "none" ? undefined : categoryId,
    );
  };

  const availableTasks = allTasks.filter(
    (t) => t.taskId !== task.taskId && !task.dependencyIds.includes(t.taskId),
  );

  const selectClass =
    "w-full border border-border rounded-xl px-3 py-2 bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

  const participants: Record<string, Participant> = {
    "user-1": {
      id: "user-1",
      name: "Alice",
      assignedToType: "PERSON",
    },

    "user-2": {
      id: "user-2",
      name: "Bob",
      assignedToType: "PERSON",
    },

    "user-3": {
      id: "user-3",
      name: "Charlie",
      assignedToType: "PERSON",
    },

    "team-a": {
      id: "team-a",
      name: "Team Alpha",
      assignedToType: "GROUP",
    },

    "team-b": {
      id: "team-b",
      name: "Team Beta",
      assignedToType: "GROUP",
    },
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border rounded-[2rem]'>
        <DialogHeader>
          <DialogTitle className='flex flex-wrap items-center gap-2 text-foreground font-heading'>
            {task.taskName}
            <Badge className={cn(statusColors[task.status], "text-xs")}>
              {task.status.replace("_", " ")}
            </Badge>
            {task.isMilestone && (
              <Badge className='bg-amber-500/15 text-amber-500 border-amber-500/20 text-xs'>
                <Star className='h-3 w-3 mr-1' />
                Milestone
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className='mt-4'>
          <TabsList className='grid w-full grid-cols-5 bg-muted/30 border border-border rounded-xl p-1'>
            {["general", "dependencies", "tags", "timeline", "history"].map(
              (tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className='rounded-lg text-xs capitalize data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm text-muted-foreground'
                >
                  {tab}
                </TabsTrigger>
              ),
            )}
          </TabsList>

          {/* ── General ── */}
          <TabsContent value='general' className='space-y-4 mt-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='sm:col-span-2 rounded-xl border border-border bg-muted/10 p-4'>
                <label className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                  Description
                </label>
                <p className='mt-1.5 text-sm text-foreground'>
                  {task.taskDescription || "No description provided"}
                </p>
              </div>

              <InfoCell label='Priority'>
                <Select
                  value={task.priority}
                  onValueChange={(v) =>
                    handlePriorityChange(v as Task["priority"])
                  }
                >
                  <SelectTrigger className='w-full border-border rounded-xl bg-card'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-card border-border rounded-xl'>
                    <SelectItem value='LOW'>Low</SelectItem>
                    <SelectItem value='NORMAL'>Normal</SelectItem>
                    <SelectItem value='HIGH'>High</SelectItem>
                    <SelectItem value='URGENT'>Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </InfoCell>

              <InfoCell label='Points'>
                <Input
                  type='number'
                  value={task.points}
                  onChange={(e) =>
                    handlePointsChange(parseInt(e.target.value) || 0)
                  }
                  className='border-border rounded-xl bg-card'
                />
              </InfoCell>

              <InfoCell label='Category'>
                <Select
                  value={task.category?.categoryId || "none"}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className='w-full border-border rounded-xl bg-card'>
                    <SelectValue placeholder='Select category' />
                  </SelectTrigger>
                  <SelectContent className='bg-card border-border rounded-xl'>
                    <SelectItem value='none'>None</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.categoryId} value={cat.categoryId}>
                        <div className='flex items-center gap-2'>
                          <div
                            className='w-2 h-2 rounded-full'
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </InfoCell>

              <InfoCell label='Assigned To'>
                <Select
                  value={
                    task.assignedTo && task.assignedToType
                      ? `${task.assignedToType}:${task.assignedTo}`
                      : "unassign"
                  }
                  onValueChange={(v) => {
                    const [type, id] = v.split(":");
                    handleAssigneeChange(id, type as AssignedToType);
                  }}
                >
                  <SelectTrigger className='w-full border-border rounded-xl bg-card'>
                    <SelectValue placeholder='Assign to...' />
                  </SelectTrigger>

                  <SelectContent className='bg-card border-border rounded-xl'>
                    <SelectItem value='unassign'>Unassigned</SelectItem>

                    {Object.values(participants).map((participant) => (
                      <SelectItem
                        key={participant.id}
                        value={`${participant.assignedToType}:${participant.id}`}
                      >
                        {participant.assignedToType === "GROUP" ? "👥" : "👤"}{" "}
                        {participant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </InfoCell>

              <InfoCell label='Reviewer'>
                <Select
                  value={task.reviewedBy || "none"}
                  onValueChange={(v) =>
                    handleReviewerChange(v === "none" ? "" : v)
                  }
                >
                  <SelectTrigger className='w-full border-border rounded-xl bg-card'>
                    <SelectValue placeholder='Select reviewer' />
                  </SelectTrigger>
                  <SelectContent className='bg-card border-border rounded-xl'>
                    //TODO: Reviewers should come from meeting service
                    <SelectItem value='none'>None</SelectItem>
                    <SelectItem value='reviewer1'>👤 Review User 1</SelectItem>
                    <SelectItem value='reviewer2'>👤 Review User 2</SelectItem>
                  </SelectContent>
                </Select>
              </InfoCell>

              <InfoCell label='Visibility'>
                <div className='flex gap-2 flex-wrap'>
                  {(["PUBLIC", "PRIVATE", "GROUP"] as Task["visibility"][]).map(
                    (v) => {
                      const Icon =
                        v === "PUBLIC" ? Globe : v === "PRIVATE" ? Lock : Users;
                      return (
                        <Button
                          key={v}
                          size='sm'
                          variant={
                            task.visibility === v ? "default" : "outline"
                          }
                          onClick={() => handleVisibilityChange(v)}
                          className={cn(
                            "gap-1 h-7 text-xs rounded-lg",
                            task.visibility === v
                              ? "bg-primary text-primary-foreground"
                              : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/30",
                          )}
                        >
                          <Icon className='h-3 w-3' />
                          {v.charAt(0) + v.slice(1).toLowerCase()}
                        </Button>
                      );
                    },
                  )}
                </div>
              </InfoCell>

              <InfoCell label='Status'>
                <Select value={task.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className='w-full border-border rounded-xl bg-card'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-card border-border rounded-xl'>
                    <SelectItem value='IN_BACKLOG'>In Backlog</SelectItem>
                    <SelectItem value='ASSIGNED'>Assigned</SelectItem>
                    <SelectItem value='IN_PROGRESS'>In Progress</SelectItem>
                    <SelectItem value='BLOCKED'>Blocked</SelectItem>
                    <SelectItem value='IN_REVIEW'>In Review</SelectItem>
                    <SelectItem value='COMPLETED'>Completed</SelectItem>
                    <SelectItem value='CANCELLED'>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </InfoCell>

              <InfoCell label='Progress'>
                <div className='flex items-center gap-3'>
                  <input
                    type='range'
                    min='0'
                    max='100'
                    value={task.progressPercent}
                    onChange={(e) =>
                      handleProgressChange(parseInt(e.target.value))
                    }
                    className='flex-1'
                  />
                  <span className='text-sm font-medium text-foreground w-10 text-right'>
                    {task.progressPercent}%
                  </span>
                </div>
              </InfoCell>

              <InfoCell label='Milestone'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Mark as milestone
                  </span>
                  <Switch
                    checked={task.isMilestone}
                    onCheckedChange={handleMilestoneToggle}
                  />
                </div>
              </InfoCell>

              <InfoCell label='Requires Review'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Needs review before completion
                  </span>
                  <Switch
                    checked={task.requiresReview}
                    onCheckedChange={handleRequiresReviewToggle}
                  />
                </div>
              </InfoCell>

              <InfoCell label='Recurrence'>
                <Select
                  value={task.recurrenceInterval || "none"}
                  onValueChange={handleRecurrenceChange}
                >
                  <SelectTrigger className='w-full border-border rounded-xl bg-card'>
                    <SelectValue placeholder='No recurrence' />
                  </SelectTrigger>
                  <SelectContent className='bg-card border-border rounded-xl'>
                    <SelectItem value='none'>No recurrence</SelectItem>
                    <SelectItem value='DAILY'>Daily</SelectItem>
                    <SelectItem value='WEEKLY'>Weekly</SelectItem>
                    <SelectItem value='MONTHLY'>Monthly</SelectItem>
                    <SelectItem value='QUARTERLY'>Quarterly</SelectItem>
                    <SelectItem value='YEARLY'>Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </InfoCell>
            </div>
          </TabsContent>

          {/* ── Dependencies ── */}
          <TabsContent value='dependencies' className='space-y-4 mt-4'>
            {/* Add form */}
            <div className='rounded-xl border border-border bg-muted/10 p-4 space-y-3'>
              <h3 className='font-heading text-sm font-semibold text-foreground'>
                Add Dependency
              </h3>

              <div className='space-y-2'>
                <div>
                  <Label className='text-xs text-muted-foreground'>Task</Label>
                  <select
                    className={cn(selectClass, "mt-1")}
                    value={selectedDependency}
                    onChange={(e) => setSelectedDependency(e.target.value)}
                  >
                    <option value=''>Select a task</option>
                    {availableTasks.map((t) => (
                      <option key={t.taskId} value={t.taskId}>
                        {t.taskName} ({t.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className='text-xs text-muted-foreground'>
                    Dependency type
                  </Label>
                  <select
                    className={cn(selectClass, "mt-1")}
                    value={selectedDependencyType}
                    onChange={(e) =>
                      setSelectedDependencyType(
                        e.target.value as DependencyType,
                      )
                    }
                  >
                    <option value='FINISH_TO_START'>Finish → Start</option>
                    <option value='START_TO_START'>Start → Start</option>
                    <option value='FINISH_TO_FINISH'>Finish → Finish</option>
                    <option value='START_TO_FINISH'>Start → Finish</option>
                  </select>
                </div>

                <div>
                  <Label className='text-xs text-muted-foreground'>
                    Lag days
                  </Label>
                  <Input
                    type='number'
                    min={0}
                    value={lagDays}
                    onChange={(e) => setLagDays(Number(e.target.value))}
                    className='border-border rounded-xl bg-card mt-1'
                    placeholder='0'
                  />
                </div>

                <Button
                  onClick={handleAddDependency}
                  disabled={!selectedDependency || dependenciesLoading}
                  size='sm'
                  className='w-full gap-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl mt-1'
                >
                  <Plus className='h-3 w-3' /> Add dependency
                </Button>
              </div>
            </div>

            {/* List */}
            <div>
              <h3 className='font-heading text-sm font-semibold text-foreground mb-3'>
                Existing Dependencies
              </h3>

              {dependenciesLoading ? (
                <p className='text-muted-foreground text-sm text-center py-6'>
                  Loading...
                </p>
              ) : (
                <div className='space-y-2'>
                  {dependencies.map((dep) => (
                    <DependencyRow
                      key={dep.dependsOnTaskId}
                      dep={dep}
                      onUpdate={(dependencyId, data) =>
                        updateDependency(
                          contextId,
                          task.taskId,
                          dependencyId,
                          data,
                        )
                      }
                      onDelete={(dependencyId) =>
                        handleRemoveDependency(dependencyId)
                      }
                    />
                  ))}
                  {dependencies.length === 0 && (
                    <p className='text-muted-foreground text-sm text-center py-6'>
                      No dependencies defined
                    </p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Tags ── */}
          <TabsContent value='tags' className='space-y-4 mt-4'>
            <div className='rounded-xl border border-border bg-muted/10 p-4'>
              <h3 className='font-heading text-sm font-semibold text-foreground mb-3'>
                Add Tag
              </h3>
              <div className='flex gap-2'>
                <select
                  className={cn(selectClass, "flex-1")}
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                >
                  <option value=''>Select a tag</option>
                  {tags
                    .filter(
                      (t) => !task.tags.find((tt) => tt.tagId === t.tagId),
                    )
                    .map((tag) => (
                      <option key={tag.tagId} value={tag.tagId}>
                        {tag.name}
                      </option>
                    ))}
                </select>
                <Button
                  onClick={handleAddTag}
                  size='sm'
                  className='gap-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl'
                >
                  <Plus className='h-3 w-3' /> Add
                </Button>
              </div>
            </div>

            <div>
              <h3 className='font-heading text-sm font-semibold text-foreground mb-3'>
                Current Tags
              </h3>
              <div className='flex gap-2 flex-wrap'>
                {task.tags.map((tag) => (
                  <div
                    key={tag.tagId}
                    className='flex items-center gap-1.5 rounded-full border border-border bg-muted/20 px-3 py-1.5 hover:bg-muted/40 transition-colors'
                  >
                    <div
                      className='w-2 h-2 rounded-full'
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className='text-xs text-foreground'>{tag.name}</span>
                    <button
                      onClick={() => handleRemoveTag(tag.tagId)}
                      className='ml-0.5 text-muted-foreground hover:text-destructive transition-colors'
                    >
                      <XCircle className='h-3 w-3' />
                    </button>
                  </div>
                ))}
                {task.tags.length === 0 && (
                  <p className='text-muted-foreground text-sm py-4'>
                    No tags assigned
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── Timeline ── */}
          <TabsContent value='timeline' className='space-y-2 mt-4'>
            <div className='rounded-xl border border-border bg-muted/10 p-4'>
              <h3 className='font-heading text-sm font-semibold text-foreground mb-3'>
                Dates
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <Label className='text-xs text-muted-foreground'>
                    Start Date
                  </Label>
                  <Input
                    type='date'
                    value={task.startDate?.split("T")[0] || ""}
                    onChange={(e) =>
                      handleUpdateField("dates", {
                        startDate: e.target.value || undefined,
                      })
                    }
                    className='border-border rounded-xl bg-card mt-1'
                  />
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>
                    End Date
                  </Label>
                  <Input
                    type='date'
                    value={task.endDate?.split("T")[0] || ""}
                    onChange={(e) =>
                      handleUpdateField("dates", {
                        endDate: e.target.value || undefined,
                      })
                    }
                    className='border-border rounded-xl bg-card mt-1'
                  />
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>
                    Baseline Start
                  </Label>
                  <Input
                    type='date'
                    value={task.baselineStart?.split("T")[0] || ""}
                    onChange={(e) =>
                      handleUpdateField("dates", {
                        baselineStart: e.target.value || undefined,
                      })
                    }
                    className='border-border rounded-xl bg-card mt-1'
                  />
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>
                    Baseline End
                  </Label>
                  <Input
                    type='date'
                    value={task.baselineEnd?.split("T")[0] || ""}
                    onChange={(e) =>
                      handleUpdateField("dates", {
                        baselineEnd: e.target.value || undefined,
                      })
                    }
                    className='border-border rounded-xl bg-card mt-1'
                  />
                </div>
              </div>
            </div>

            <div className='rounded-xl border border-border bg-muted/10 p-4'>
              <h3 className='font-heading text-sm font-semibold text-foreground mb-3'>
                Hours
              </h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <Label className='text-xs text-muted-foreground'>
                    Estimated Hours
                  </Label>
                  <Input
                    type='number'
                    value={task.estimatedHours || ""}
                    onChange={(e) =>
                      handleUpdateField("hours", {
                        estimatedHours: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    className='border-border rounded-xl bg-card mt-1'
                    step='0.5'
                  />
                </div>
                <div>
                  <Label className='text-xs text-muted-foreground'>
                    Actual Hours
                  </Label>
                  <Input
                    type='number'
                    value={task.actualHours || ""}
                    onChange={(e) =>
                      handleUpdateField("hours", {
                        actualHours: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                    className='border-border rounded-xl bg-card mt-1'
                    step='0.5'
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── History ── */}
          <TabsContent value='history' className='space-y-2 mt-4'>
            {[
              {
                Icon: Clock,
                label: "Created At",
                value: task.createdAt
                  ? format(new Date(task.createdAt), "PPpp")
                  : null,
              },
              {
                Icon: Clock,
                label: "Last Activity",
                value: task.lastActivityAt
                  ? format(new Date(task.lastActivityAt), "PPpp")
                  : null,
              },
              ...(task.assignedAt
                ? [
                    {
                      Icon: User,
                      label: "Assigned At",
                      value: format(new Date(task.assignedAt), "PPpp"),
                    },
                  ]
                : []),
              ...(task.startedAt
                ? [
                    {
                      Icon: Clock,
                      label: "Started At",
                      value: format(new Date(task.startedAt), "PPpp"),
                    },
                  ]
                : []),
              ...(task.completedAt
                ? [
                    {
                      Icon: CheckCircle,
                      label: "Completed At",
                      value: format(new Date(task.completedAt), "PPpp"),
                      accent: "text-[#1D9E75]",
                    },
                  ]
                : []),
              ...(task.cancelledAt
                ? [
                    {
                      Icon: XCircle,
                      label: "Cancelled At",
                      value: format(new Date(task.cancelledAt), "PPpp"),
                      accent: "text-destructive",
                    },
                  ]
                : []),
            ].map(({ Icon, label, value, accent }) => (
              <div
                key={label}
                className='flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/10 hover:bg-muted/20 transition-colors'
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    accent ?? "text-muted-foreground",
                  )}
                />
                <span className='w-36 text-xs text-muted-foreground'>
                  {label}
                </span>
                <span className='text-sm text-foreground'>
                  {value ?? "Unknown"}
                </span>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

// Small helper for labeled info cells
function InfoCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className='rounded-xl border border-border bg-muted/10 p-4'>
      <label className='text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2'>
        {label}
      </label>
      {children}
    </div>
  );
}
