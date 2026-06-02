import React, { useState } from "react";
import type { AssignedToType, Task } from "@/types/task-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  User,
  Users,
  Globe,
  Lock,
  Tag as TagIcon,
  Star,
} from "lucide-react";
import { priorityColors, statusColors } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useAssignContext } from "@/hooks/task-service/useAssignContext";
import { LoadingSpinner } from "../spinners/LoadingSpinner";
import { ErrorDisplay } from "../shared/ErrorDisplay";

interface TaskRowComponentProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onUpdateField?: (taskId: string, field: string, value: any) => void;
  onSeeMore: (task: Task) => void;
}

export const TaskRowComponent: React.FC<TaskRowComponentProps> = ({
  task,
  onUpdate,
  onUpdateField,
  onSeeMore,
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const { participants, loading, error } = useAssignContext();
  const isSaving = React.useRef(false);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;

  const handleUpdateField = (field: string, value: any) => {
    if (onUpdateField) {
      onUpdateField(task.taskId, field, value);
    } else {
      onUpdate(task.taskId, { [field]: value });
    }
  };

  const handleEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const handleSave = (field: string) => {
    if (isSaving.current) return;
    isSaving.current = true;

    if (field === "taskName" && editValue.trim()) {
      handleUpdateField("taskName", editValue.trim());
    } else if (field === "points") {
      const parsed = parseInt(editValue);
      if (!isNaN(parsed)) handleUpdateField("points", parsed);
    } else if (field === "priority") {
      handleUpdateField("priority", editValue as Task["priority"]);
    }

    setEditingField(null);
    setTimeout(() => {
      isSaving.current = false;
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent, field: string) => {
    if (e.key === "Enter") {
      handleSave(field);
    } else if (e.key === "Escape") {
      setEditingField(null);
    }
  };

  const handleStatusChange = (status: Task["status"]) => {
    handleUpdateField("status", status);
  };

  const handleAssigneeChange = (
    assignedTo: string,
    assignedToType: AssignedToType,
  ) => {
    handleUpdateField("assign", { assignedTo, assignedToType });
  };

  const renderEditableCell = (
    field: string,
    value: string,
    displayValue: React.ReactNode,
  ) => {
    if (editingField === field) {
      return (
        <input
          type='text'
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => handleKeyPress(e, field)}
          onBlur={() => handleSave(field)}
          className='w-full px-2 py-1 border border-border rounded-lg bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50'
          autoFocus
        />
      );
    }
    return (
      <div
        onClick={() => handleEdit(field, value)}
        className='cursor-pointer hover:bg-muted/30 px-2 py-1 rounded-lg transition-colors'
      >
        {displayValue}
      </div>
    );
  };

  const visibleTags = task.tags.slice(0, 3);
  const remainingTags = task.tags.length - 3;

  return (
    <div className='flex items-center gap-3 px-4 py-3 border-b border-border/50 hover:bg-muted/10 transition-colors group'>
      {/* See More */}
      <Button
        variant='ghost'
        size='sm'
        onClick={() => onSeeMore(task)}
        className='flex-shrink-0 h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 opacity-0 group-hover:opacity-100 transition-opacity'
      >
        <MoreHorizontal className='h-4 w-4' />
      </Button>

      {/* Name / Description */}
      <div className='flex-1 min-w-[180px]'>
        {renderEditableCell(
          "taskName",
          task.taskName,
          <div className='flex items-center gap-2'>
            <div>
              <div className='font-medium text-sm text-foreground'>
                {task.taskName}
              </div>
              {task.taskDescription && (
                <div className='text-xs text-muted-foreground truncate mt-0.5'>
                  {task.taskDescription}
                </div>
              )}
            </div>
            {task.isMilestone && (
              <Star className='h-3.5 w-3.5 text-amber-500 shrink-0' />
            )}
          </div>,
        )}
      </div>

      {/* Assignment — hidden on mobile */}
      <div className='hidden sm:block'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              className='flex-shrink-0 border-border bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30 h-8 text-xs rounded-lg'
            >
              {task.assignedToType === "GROUP" ? (
                <Users className='h-3 w-3 mr-1' />
              ) : (
                <User className='h-3 w-3 mr-1' />
              )}

              <span className='max-w-[50px] truncate'>
                {task.assignedTo
                  ? participants[task.assignedTo]?.name
                  : "Assign"}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className='bg-card border-border text-foreground rounded-xl'>
            {Object.values(participants).map((participant) => (
              <DropdownMenuItem
                key={participant.id}
                onClick={() =>
                  handleAssigneeChange(
                    participant.id,
                    participant.assignedToType,
                  )
                }
                className='hover:bg-muted/30 text-sm rounded-lg'
              >
                {participant.assignedToType === "GROUP" ? "👥" : "👤"}{" "}
                {participant.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Points — hidden on small screens */}
      <div className='hidden md:block w-16 text-center'>
        {renderEditableCell(
          "points",
          task.points.toString(),
          <Badge
            variant='secondary'
            className='bg-muted/50 text-muted-foreground border-border text-xs cursor-pointer hover:bg-muted/70'
          >
            {task.points} pts
          </Badge>,
        )}
      </div>

      {/* Priority — hidden on small screens */}
      <div className='hidden md:block w-24'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Badge
              className={cn(
                priorityColors[task.priority],
                "text-xs cursor-pointer",
              )}
            >
              {task.priority}
            </Badge>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='bg-card border-border rounded-xl'>
            {(["LOW", "NORMAL", "HIGH", "URGENT"] as Task["priority"][]).map(
              (p) => (
                <DropdownMenuItem
                  key={p}
                  onClick={() => handleUpdateField("priority", p)}
                  className='hover:bg-muted/30 rounded-lg'
                >
                  {p}
                </DropdownMenuItem>
              ),
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status */}
      <div className='hidden sm:block w-28'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Badge
              className={cn(
                statusColors[task.status],
                "text-xs cursor-pointer",
              )}
            >
              {task.status.replace("_", " ")}
            </Badge>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='bg-card border-border rounded-xl'>
            {(
              [
                "IN_BACKLOG",
                "ASSIGNED",
                "IN_PROGRESS",
                "BLOCKED",
                "IN_REVIEW",
                "COMPLETED",
                "CANCELLED",
              ] as Task["status"][]
            ).map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() => handleStatusChange(s)}
                className='hover:bg-muted/30 rounded-lg'
              >
                {s.replace("_", " ")}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Visibility — hidden on small screens */}
      <div className='hidden lg:flex w-8 items-center justify-center'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='sm' className='h-6 w-6 p-0'>
              {task.visibility === "PUBLIC" && (
                <Globe className='h-4 w-4 text-[#1D9E75]' />
              )}
              {task.visibility === "PRIVATE" && (
                <Lock className='h-4 w-4 text-destructive' />
              )}
              {task.visibility === "GROUP" && (
                <Users className='h-4 w-4 text-primary' />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className='bg-card border-border rounded-xl'>
            {(["PUBLIC", "PRIVATE", "GROUP"] as Task["visibility"][]).map(
              (v) => (
                <DropdownMenuItem
                  key={v}
                  onClick={() => handleUpdateField("visibility", v)}
                  className='hover:bg-muted/30 rounded-lg gap-2'
                >
                  {v === "PUBLIC" && <Globe className='h-3 w-3' />}
                  {v === "PRIVATE" && <Lock className='h-3 w-3' />}
                  {v === "GROUP" && <Users className='h-3 w-3' />}
                  {v.charAt(0) + v.slice(1).toLowerCase()}
                </DropdownMenuItem>
              ),
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Category — hidden on small screens */}
      <div className='hidden lg:block w-24'>
        {task.category && (
          <div className='flex items-center gap-1.5 cursor-pointer hover:opacity-80'>
            <div
              className='w-2 h-2 rounded-full shrink-0'
              style={{ backgroundColor: task.category.color }}
            />
            <span className='text-xs text-muted-foreground truncate'>
              {task.category.name}
            </span>
          </div>
        )}
      </div>

      {/* Tags — hidden on smaller screens */}
      <div className='hidden xl:flex flex-1 min-w-[120px] gap-1 flex-wrap'>
        {visibleTags.map((tag) => (
          <Badge
            key={tag.tagId}
            variant='outline'
            className='text-xs border-border text-muted-foreground bg-muted/20 hover:bg-muted/40 transition-colors'
          >
            <TagIcon className='h-2.5 w-2.5 mr-1' />
            {tag.name}
          </Badge>
        ))}
        {remainingTags > 0 && (
          <Badge
            variant='outline'
            className='text-xs border-border text-muted-foreground bg-muted/20'
          >
            +{remainingTags}
          </Badge>
        )}
      </div>
    </div>
  );
};
