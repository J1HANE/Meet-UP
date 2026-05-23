import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type {
  Task,
  Tag,
  Category,
  RecurrenceInterval,
} from "@/types/task-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { pluckProperty } from "@/lib/utils";

const taskSchema = z.object({
  taskName: z.string().min(1, "Task name is required"),
  taskDescription: z.string().optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),
  points: z.number().min(0).max(100),
  visibility: z.enum(["PUBLIC", "PRIVATE", "GROUP"]),
  status: z.enum([
    "IN_BACKLOG",
    "ASSIGNED",
    "IN_PROGRESS",
    "BLOCKED",
    "IN_REVIEW",
    "COMPLETED",
    "CANCELLED",
  ]),
  baselineStart: z.string().optional(),
  baselineEnd: z.string().optional(),
  estimatedHours: z.number().optional().nullable(),
  requiresReview: z.boolean(),
  isMilestone: z.boolean(),
  isRecurring: z.boolean().optional(),
  recurrenceInterval: z
    .enum(["DAILY", "WEEKLY", "BIWEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"])
    .nullable()
    .optional(),
  parentTaskId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  tagIds: z.array(z.string()).nullable().optional(),
});

type TaskFormData = z.infer<typeof taskSchema> & {
  recurrenceInterval?:
    | "DAILY"
    | "WEEKLY"
    | "BIWEEKLY"
    | "MONTHLY"
    | "QUARTERLY"
    | "YEARLY"
    | null;
  parentTaskId?: string | null;
};

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: Partial<Task> & { categoryId?: string; tagIds?: string[] },
  ) => void;
  initialData?: Partial<Task>;
  tags?: Tag[];
  categories?: Category[];
}

export const TaskForm: React.FC<TaskFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  tags = [],
  categories = [],
}) => {
  const [selectedTags, setSelectedTags] = useState<Tag[]>(
    initialData?.tags || [],
  );
  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >(initialData?.category);

  const [isRecurring, setIsRecurring] = useState(
    !!initialData?.recurrenceInterval,
  );

  const [recurrenceInterval, setRecurrenceInterval] =
    useState<RecurrenceInterval | null>(
      initialData?.recurrenceInterval || null,
    );

  const [parentTaskId, setParentTaskId] = useState<string | undefined>(
    initialData?.parentTaskId || undefined,
  );

  const { tasks } = useTaskStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      taskName: initialData?.taskName || "",
      taskDescription: initialData?.taskDescription || "",
      priority: initialData?.priority || "NORMAL",
      points: initialData?.points || 0,
      visibility: initialData?.visibility || "PUBLIC",
      status: initialData?.status || "IN_BACKLOG",
      baselineStart: initialData?.baselineStart?.split("T")[0] || "",
      baselineEnd: initialData?.baselineEnd?.split("T")[0] || "",
      estimatedHours: initialData?.estimatedHours || undefined,
      requiresReview: initialData?.requiresReview || false,
      isMilestone: initialData?.isMilestone || false,
      recurrenceInterval: initialData?.recurrenceInterval || undefined,
    },
  });

  const onFormSubmit = (data: TaskFormData) => {
    onSubmit({
      ...data,
      tags: selectedTags,
      contextId: initialData?.contextId || "project-123",
      // Convert empty strings to undefined for dates
      baselineStart: data.baselineStart || undefined,
      baselineEnd: data.baselineEnd || undefined,
      estimatedHours: data.estimatedHours || undefined,
      isRecurring: isRecurring,
      recurrenceInterval: isRecurring ? recurrenceInterval : null,
      parentTaskId: parentTaskId || null,
      categoryId: selectedCategory?.categoryId,
      tagIds: pluckProperty(selectedTags, "tagId"),
    });
    reset();
    setSelectedTags([]);
    setSelectedCategory(undefined);
    onClose();
  };

  const addTag = (tag: Tag) => {
    if (!selectedTags.find((t) => t.tagId === tag.tagId)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tagId: string) => {
    setSelectedTags(selectedTags.filter((t) => t.tagId !== tagId));
  };

  const inputClass =
    "border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/50 rounded-xl";
  const labelClass =
    "block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border rounded-[2rem]'>
        <DialogHeader>
          <DialogTitle className='font-heading text-foreground'>
            {initialData ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-4 mt-2'>
          {/* Task name */}
          <div>
            <label className={labelClass}>Task Name *</label>
            <Input
              {...register("taskName")}
              placeholder='Enter task name'
              className={inputClass}
            />
            {errors.taskName && (
              <p className='text-destructive text-xs mt-1'>
                {errors.taskName.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description</label>
            <Textarea
              {...register("taskDescription")}
              placeholder='Enter task description'
              rows={3}
              className={inputClass}
            />
          </div>

          {/* Parent Task */}
          <div>
            <label className={labelClass}>Parent Task</label>
            <select
              value={parentTaskId || ""}
              onChange={(e) => setParentTaskId(e.target.value || undefined)}
              className='w-full border border-border rounded-xl px-3 py-2 bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50'
            >
              <option value=''>None (Root Task)</option>
              {tasks
                .filter((t) => t.taskId !== initialData?.taskId) // Can't be its own parent
                .map((task) => (
                  <option key={task.taskId} value={task.taskId}>
                    {task.taskName} {task.isMilestone && "🎯"}
                  </option>
                ))}
            </select>
          </div>

          {/* Priority + Points */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className={labelClass}>Priority</label>
              <select
                {...register("priority")}
                className='w-full border border-border rounded-xl px-3 py-2 bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50'
              >
                <option value='LOW'>Low</option>
                <option value='NORMAL'>Normal</option>
                <option value='HIGH'>High</option>
                <option value='URGENT'>Urgent</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Points</label>
              <Input
                type='number'
                {...register("points", { valueAsNumber: true })}
                className={inputClass}
              />
              {errors.points && (
                <p className='text-destructive text-xs mt-1'>
                  {errors.points.message}
                </p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className={labelClass}>Planned Start Date</label>
              <Input
                type='date'
                {...register("baselineStart")}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Planned End Date</label>
              <Input
                type='date'
                {...register("baselineEnd")}
                className={inputClass}
              />
            </div>
          </div>

          {/* Estimated Hours */}
          <div>
            <label className={labelClass}>Estimated Hours</label>
            <Input
              type='number'
              step='0.5'
              {...register("estimatedHours", { valueAsNumber: true })}
              className={inputClass}
              placeholder='Enter estimated hours'
            />
          </div>

          {/* Visibility + Status */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className={labelClass}>Visibility</label>
              <select
                {...register("visibility")}
                className='w-full border border-border rounded-xl px-3 py-2 bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50'
              >
                <option value='PUBLIC'>Public</option>
                <option value='PRIVATE'>Private</option>
                <option value='GROUP'>Group</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                {...register("status")}
                className='w-full border border-border rounded-xl px-3 py-2 bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50'
              >
                <option value='IN_BACKLOG'>In Backlog</option>
                <option value='ASSIGNED'>Assigned</option>
                <option value='IN_PROGRESS'>In Progress</option>
                <option value='BLOCKED'>Blocked</option>
                <option value='IN_REVIEW'>In Review</option>
                <option value='COMPLETED'>Completed</option>
                <option value='CANCELLED'>Cancelled</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className={labelClass}>Category</label>
            <select
              value={selectedCategory?.categoryId || ""}
              onChange={(e) => {
                const category = categories.find(
                  (c) => c.categoryId === e.target.value,
                );
                setSelectedCategory(category);
              }}
              className='w-full border border-border rounded-xl px-3 py-2 bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50'
            >
              <option value=''>None</option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className={labelClass}>Tags</label>
            {selectedTags.length > 0 && (
              <div className='flex gap-2 mb-2.5 flex-wrap'>
                {selectedTags.map((tag) => (
                  <div
                    key={tag.tagId}
                    className='flex items-center gap-1.5 rounded-full border border-border bg-muted/20 px-3 py-1 text-xs text-foreground'
                  >
                    <div
                      className='w-2 h-2 rounded-full shrink-0'
                      style={{ backgroundColor: tag.color }}
                    />
                    <span>{tag.name}</span>
                    <button
                      type='button'
                      onClick={() => removeTag(tag.tagId)}
                      className='ml-0.5 text-muted-foreground hover:text-destructive transition-colors'
                    >
                      <X className='h-3 w-3' />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <select
              onChange={(e) => {
                const tag = tags.find((t) => t.tagId === e.target.value);
                if (tag) addTag(tag);
                e.target.value = ""; // Reset select
              }}
              value=''
              className='w-full border border-border rounded-xl px-3 py-2 bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50'
            >
              <option value=''>Add a tag…</option>
              {tags
                .filter((t) => !selectedTags.find((st) => st.tagId === t.tagId))
                .map((tag) => (
                  <option key={tag.tagId} value={tag.tagId}>
                    {tag.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Recurrence */}
          <div className='space-y-3'>
            <label className='flex items-center gap-2.5 cursor-pointer group'>
              <input
                type='checkbox'
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className='h-4 w-4 accent-primary cursor-pointer'
              />
              <span className='text-sm text-muted-foreground group-hover:text-foreground transition-colors'>
                Recurring Task
              </span>
            </label>

            {isRecurring && (
              <div>
                <label className={labelClass}>Recurrence Interval</label>
                <select
                  value={recurrenceInterval || ""}
                  onChange={(e) =>
                    setRecurrenceInterval(
                      (e.target.value as RecurrenceInterval) || null,
                    )
                  }
                  className='w-full border border-border rounded-xl px-3 py-2 bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50'
                >
                  <option value='DAILY'>Daily</option>
                  <option value='WEEKLY'>Weekly</option>
                  <option value='BIWEEKLY'>Bi-weekly</option>
                  <option value='MONTHLY'>Monthly</option>
                  <option value='QUARTERLY'>Quarterly</option>
                  <option value='YEARLY'>Yearly</option>
                </select>
              </div>
            )}
          </div>

          {/* Checkboxes */}
          <div className='flex items-center gap-6'>
            <label className='flex items-center gap-2.5 cursor-pointer group'>
              <input
                type='checkbox'
                {...register("requiresReview")}
                className='h-4 w-4 accent-primary cursor-pointer'
              />
              <span className='text-sm text-muted-foreground group-hover:text-foreground transition-colors'>
                Requires Review
              </span>
            </label>
            <label className='flex items-center gap-2.5 cursor-pointer group'>
              <input
                type='checkbox'
                {...register("isMilestone")}
                className='h-4 w-4 accent-primary cursor-pointer'
              />
              <span className='text-sm text-muted-foreground group-hover:text-foreground transition-colors'>
                Milestone
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className='flex justify-end gap-2 pt-3 border-t border-border'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              className='border-border text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-xl'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl'
            >
              {initialData ? "Update Task" : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
