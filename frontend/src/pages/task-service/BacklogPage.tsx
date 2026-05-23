import React, { useState } from "react";
import { useTaskStore } from "@/store/taskStore";
import { TaskRowComponent } from "@/components/tasks-service/TaskRowComponent";
import { TaskForm } from "@/forms/task-service/TaskForm";
import { TaskHeader } from "@/components/tasks-service/TaskHeader";
import { Button } from "@/components/ui/button";
import { TaskDetailsModal } from "@/components/tasks-service/TaskDetailsModal";
import type { Task } from "@/types/task-service";
import { Plus, ListTodo } from "lucide-react";
import { motion } from "framer-motion";
import { useTaskActions } from "@/hooks/task-service/useTaskActions";
import { useTaskContextData } from "@/hooks/task-service/useTaskContextData";
import { ToastManager } from "@/lib/toastUtils";

export const BacklogPage: React.FC = () => {
  const {
    tasks,

    createTask,

    tags,
    categories,
  } = useTaskStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { contextId, meetingName } = useTaskContextData();

  const { handleUpdateTask, handleUpdateTaskField } = useTaskActions();
  const handleCreateTask = (data: Partial<Task>) => {
    ToastManager.createTask(createTask(contextId, data));
  };

  const handleSeeMore = (task: Task) => {
    setSelectedTask(task);
  };

  const backlogTasks = tasks.filter((t) => t.status === "IN_BACKLOG");

  return (
    <div className='min-h-screen bg-background'>
      <TaskHeader contextName={meetingName} />

      <div className='container mx-auto px-4 sm:px-6 py-6 space-y-5'>
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className='flex flex-wrap items-center justify-between gap-4'
        >
          <div>
            <p className='mt-1 text-sm text-muted-foreground'>
              {backlogTasks.length} task{backlogTasks.length !== 1 ? "s" : ""}{" "}
              awaiting assignment
            </p>
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className='gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl'
          >
            <Plus className='h-4 w-4' />
            Create Task
          </Button>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className='rounded-[2rem] border border-border bg-card overflow-hidden'
        >
          {/* Column headers — hidden on mobile, visible from md */}
          <div className='hidden md:flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/20 text-xs font-medium text-muted-foreground uppercase tracking-wide'>
            <div className='w-8 shrink-0' />
            <div className='flex-1 min-w-[180px]'>Task Name</div>
            <div className='hidden sm:block w-28'>Assigned To</div>
            <div className='hidden md:block w-16 text-center'>Points</div>
            <div className='hidden md:block w-24'>Priority</div>
            <div className='hidden sm:block w-28'>Status</div>
            <div className='hidden lg:block w-8' title='Visibility' />
            <div className='hidden lg:block w-24'>Category</div>
            <div className='hidden xl:flex flex-1 min-w-[120px]'>Tags</div>
          </div>

          {/* Rows */}
          <div>
            {backlogTasks.map((task, idx) => (
              <motion.div
                key={task.taskId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
              >
                <TaskRowComponent
                  task={task}
                  onUpdate={handleUpdateTask}
                  onUpdateField={handleUpdateTaskField}
                  onSeeMore={handleSeeMore}
                />
              </motion.div>
            ))}
          </div>

          {backlogTasks.length === 0 && (
            <div className='flex flex-col items-center justify-center py-16 gap-3 text-center'>
              <div className='flex h-14 w-14 items-center justify-center rounded-full bg-muted/30 border border-border'>
                <ListTodo className='h-6 w-6 text-muted-foreground' />
              </div>
              <div>
                <p className='font-medium text-foreground'>
                  No tasks in backlog
                </p>
                <p className='text-sm text-muted-foreground mt-1'>
                  Create your first task to get started
                </p>
              </div>
              <Button
                onClick={() => setIsFormOpen(true)}
                size='sm'
                className='mt-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl'
              >
                <Plus className='h-3.5 w-3.5' />
                Create Task
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      <TaskForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateTask}
        tags={tags}
        categories={categories}
      />

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onUpdateField={handleUpdateTaskField}
          tags={tags}
          categories={categories}
          allTasks={tasks}
        />
      )}
    </div>
  );
};
