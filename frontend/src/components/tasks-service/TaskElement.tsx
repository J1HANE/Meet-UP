import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { Task } from "@/types/task-service";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, Flag } from "lucide-react";
import { priorityColors, cn } from "@/lib/utils";
import { TaskDetailsModal } from "./TaskDetailsModal";
import { useTaskStore } from "@/store/taskStore";
import { useTaskActions } from "@/hooks/task-service/useTaskActions";

interface TaskElementProps {
  task: Task;
}

export const TaskElement: React.FC<TaskElementProps> = ({ task }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.taskId,
      data: task,
    });

  const [modalOpen, setModalOpen] = useState(false);
  const { categories, tags, tasks } = useTaskStore();
  const { handleUpdateTask, handleUpdateTaskField } = useTaskActions();

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-[1.25rem] border border-border bg-card p-3.5",
        "hover:border-primary/30 hover:bg-card/80 hover:shadow-md",
        "transition-all duration-150",
        isDragging &&
          "opacity-50 shadow-xl scale-[1.02] ring-2 ring-primary/30",
      )}
    >
      {/* Header: drag handle + open button */}
      <div className='flex items-start justify-between mb-2.5'>
        <div
          {...listeners}
          {...attributes}
          className='font-medium text-sm text-foreground leading-snug flex-1 cursor-move'
        >
          {task.taskName}
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className={cn(
            "ml-2 shrink-0 rounded-lg p-1 text-muted-foreground/50",
            "hover:text-foreground hover:bg-muted/50 transition-colors duration-150",
          )}
        >
          <ExternalLink className='h-3.5 w-3.5' />
        </button>
      </div>

      {/* Priority + Points */}
      <div className='flex items-center gap-1.5 flex-wrap mb-2.5'>
        {task.priority && (
          <Badge
            className={cn(priorityColors[task.priority], "text-xs gap-1 h-5")}
          >
            <Flag className='h-2.5 w-2.5' />
            {task.priority}
          </Badge>
        )}
        {task.points != null && task.points > 0 && (
          <Badge
            variant='secondary'
            className='text-xs h-5 bg-muted/50 text-muted-foreground border-border'
          >
            {task.points} pts
          </Badge>
        )}
      </div>

      {/* Assignee */}
      {task.assignedTo && (
        <div className='flex items-center gap-1.5 text-xs text-muted-foreground mb-2'>
          <div className='flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-[9px] font-bold shrink-0'>
            {task.assignedTo.slice(0, 2).toUpperCase()}
          </div>
          <span className='truncate'>{task.assignedTo}</span>
        </div>
      )}

      {/* Dates */}
      {task.startDate && task.endDate && (
        <div className='flex items-center gap-1.5 text-xs text-muted-foreground mb-2'>
          <Calendar className='h-3 w-3 shrink-0' />
          <span className='truncate'>
            {task.startDate} → {task.endDate}
          </span>
        </div>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className='flex gap-1 flex-wrap mb-2'>
          {task.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag.tagId}
              variant='outline'
              className='text-xs h-4 border-border text-muted-foreground bg-muted/20 gap-1'
            >
              <div
                className='w-1.5 h-1.5 rounded-full'
                style={{ backgroundColor: tag.color }}
              />
              {tag.name}
            </Badge>
          ))}
          {task.tags.length > 2 && (
            <Badge
              variant='outline'
              className='text-xs h-4 border-border text-muted-foreground bg-muted/20'
            >
              +{task.tags.length - 2}
            </Badge>
          )}
        </div>
      )}

      {/* Progress bar */}
      {task.progressPercent > 0 && (
        <div className='mt-2.5 space-y-1'>
          <div className='flex justify-between items-center'>
            <span className='text-[10px] text-muted-foreground'>Progress</span>
            <span className='text-[10px] font-medium text-foreground'>
              {task.progressPercent}%
            </span>
          </div>
          <div className='bg-muted rounded-full h-1.5'>
            <div
              className='bg-primary rounded-full h-1.5 transition-all'
              style={{ width: `${task.progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <TaskDetailsModal
        task={task}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpdate={handleUpdateTask}
        onUpdateField={handleUpdateTaskField}
        categories={categories}
        tags={tags}
        allTasks={tasks}
      />
    </div>
  );
};
