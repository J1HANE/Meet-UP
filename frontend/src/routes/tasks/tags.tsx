import React, { useEffect, useState } from "react";
import { useTaskStore } from "@/store/taskStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit2,
  Trash2,
  Plus,
  Tag as TagIcon,
  Grid3X3,
  MoreHorizontal,
} from "lucide-react";
import { tagApi } from "@/lib/api/taskApi";
import type { Tag } from "@/types/task-service";
import { motion, AnimatePresence } from "framer-motion";
import { TaskHeader } from "@/components/tasks-service/TaskHeader";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tasks/tags")({
  component: TagManagementPage,
});

const contextId = "project-123"; // This would come from context/route params

function TagManagementPage() {
  const { tags, fetchTags } = useTaskStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3498db",
    icon: "",
  });

  const meetingName = "Project Alpha";

  useEffect(() => {
    fetchTags(contextId);
  }, [fetchTags]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await tagApi.update(contextId, editingTag.tagId, formData);
      } else {
        await tagApi.create(contextId, formData);
      }
      await fetchTags(contextId);
      setIsModalOpen(false);
      setEditingTag(null);
      setFormData({ name: "", description: "", color: "#3498db", icon: "" });
    } catch (error) {
      console.error("Failed to save tag:", error);
    }
  };

  const handleDelete = async (tagId: string) => {
    if (confirm("Are you sure you want to delete this tag?")) {
      try {
        await tagApi.delete(contextId, tagId);
        await fetchTags(contextId);
      } catch (error) {
        console.error("Failed to delete tag:", error);
      }
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      description: tag.description || "",
      color: tag.color,
      icon: tag.icon,
    });
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingTag(null);
    setFormData({
      name: "",
      description: "",
      color: "#3498db",
      icon: "",
    });
    setIsModalOpen(true);
  };

  const inputClass =
    "border-border bg-card text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/50 rounded-xl";

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
              {tags.length} tag{tags.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <div className='flex items-center gap-2'>
            {/* View toggle */}
            <div className='flex rounded-lg border border-border overflow-hidden'>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid3X3 className='w-3.5 h-3.5' />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === "table"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TagIcon className='w-3.5 h-3.5' />
              </button>
            </div>
            <Button
              onClick={openCreate}
              className='gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl'
            >
              <Plus className='h-4 w-4' />
              Create Tag
            </Button>
          </div>
        </motion.div>

        {/* Content based on view mode */}
        {tags.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 gap-3 text-center rounded-[2rem] border border-border bg-card'>
            <div className='flex h-14 w-14 items-center justify-center rounded-full bg-muted/30 border border-border'>
              <TagIcon className='h-6 w-6 text-muted-foreground' />
            </div>
            <div>
              <p className='font-medium text-foreground'>No tags yet</p>
              <p className='text-sm text-muted-foreground mt-1'>
                Create a tag to start organising your tasks
              </p>
            </div>
            <Button
              onClick={openCreate}
              size='sm'
              className='mt-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl'
            >
              <Plus className='h-3.5 w-3.5' />
              Create Tag
            </Button>
          </div>
        ) : (
          <AnimatePresence mode='wait'>
            {viewMode === "grid" ? (
              <motion.div
                key='grid'
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
              >
                {tags.map((tag, idx) => (
                  <motion.div
                    key={tag.tagId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className='group rounded-[1.5rem] border border-border bg-card p-4 hover:border-primary/30 hover:bg-card/80 transition-all'
                  >
                    <div className='flex items-start justify-between mb-3'>
                      <div className='flex items-center gap-3 min-w-0'>
                        {/* Color swatch */}
                        <div
                          className='w-10 h-10 rounded-full shrink-0 shadow-sm'
                          style={{ backgroundColor: tag.color }}
                        />
                        <div className='min-w-0'>
                          <h3 className='font-heading font-semibold text-foreground truncate'>
                            {tag.name}
                          </h3>
                          <div className='text-xs text-muted-foreground mt-0.5'>
                            {tag.taskCount || 0} task
                            {(tag.taskCount || 0) !== 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>

                      <div className='flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleEdit(tag)}
                          className='h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40'
                        >
                          <Edit2 className='h-3.5 w-3.5' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDelete(tag.tagId)}
                          className='h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                        </Button>
                      </div>
                    </div>

                    {tag.description && (
                      <p className='text-sm text-muted-foreground line-clamp-2'>
                        {tag.description}
                      </p>
                    )}

                    {tag.icon && (
                      <div className='mt-2.5 text-xs text-muted-foreground/60 flex items-center gap-1.5'>
                        <span className='font-medium'>Icon:</span>
                        <code className='bg-muted/30 rounded px-1.5 py-0.5'>
                          {tag.icon}
                        </code>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key='table'
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className='rounded-[1.5rem] border border-border bg-card overflow-hidden'
              >
                <Table>
                  <TableHeader>
                    <TableRow className='border-b border-border hover:bg-transparent'>
                      <TableHead className='text-foreground font-semibold'>
                        Color
                      </TableHead>
                      <TableHead className='text-foreground font-semibold'>
                        Name
                      </TableHead>
                      <TableHead className='text-foreground font-semibold hidden md:table-cell'>
                        Description
                      </TableHead>
                      <TableHead className='text-foreground font-semibold text-center'>
                        Tasks
                      </TableHead>
                      <TableHead className='text-foreground font-semibold hidden sm:table-cell'>
                        Icon
                      </TableHead>
                      <TableHead className='text-foreground font-semibold text-right'>
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tags.map((tag) => (
                      <TableRow
                        key={tag.tagId}
                        className='group border-b border-border hover:bg-muted/20 transition-colors'
                      >
                        <TableCell>
                          <div
                            className='w-8 h-8 rounded-full shadow-sm'
                            style={{ backgroundColor: tag.color }}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <span className='font-medium text-foreground'>
                              {tag.name}
                            </span>
                            <div className='md:hidden text-xs text-muted-foreground mt-1'>
                              {tag.description && (
                                <span className='line-clamp-1'>
                                  {tag.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='hidden md:table-cell'>
                          <span className='text-sm text-muted-foreground line-clamp-2'>
                            {tag.description || "—"}
                          </span>
                        </TableCell>
                        <TableCell className='text-center'>
                          <span className='inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-muted/50 text-sm font-medium text-foreground'>
                            {tag.taskCount || 0}
                          </span>
                        </TableCell>
                        <TableCell className='hidden sm:table-cell'>
                          <code className='text-xs bg-muted/30 rounded px-2 py-1 text-muted-foreground'>
                            {tag.icon || "—"}
                          </code>
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex items-center justify-end gap-1'>
                            {/* Desktop buttons */}
                            <div className='hidden sm:flex gap-1'>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleEdit(tag)}
                                className='h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40'
                              >
                                <Edit2 className='h-3.5 w-3.5' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleDelete(tag.tagId)}
                                className='h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                              >
                                <Trash2 className='h-3.5 w-3.5' />
                              </Button>
                            </div>
                            {/* Mobile dropdown menu */}
                            <div className='sm:hidden'>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant='ghost'
                                    size='sm'
                                    className='h-8 w-8 p-0 rounded-lg'
                                  >
                                    <MoreHorizontal className='h-4 w-4' />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align='end'
                                  className='bg-card border-border'
                                >
                                  <DropdownMenuItem
                                    onClick={() => handleEdit(tag)}
                                    className='cursor-pointer'
                                  >
                                    <Edit2 className='h-4 w-4 mr-2' />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(tag.tagId)}
                                    className='cursor-pointer text-destructive focus:text-destructive'
                                  >
                                    <Trash2 className='h-4 w-4 mr-2' />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='bg-card border-border rounded-[2rem] max-w-md'>
          <DialogHeader>
            <DialogTitle className='font-heading text-foreground'>
              {editingTag ? "Edit Tag" : "Create New Tag"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className='space-y-4 mt-2'>
            <div>
              <label className='block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5'>
                Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className={inputClass}
                placeholder='e.g. Bug, Feature, Urgent'
              />
            </div>
            <div>
              <label className='block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5'>
                Description
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className={inputClass}
                placeholder='Short description of this tag'
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5'>
                  Color
                </label>
                <div className='flex items-center gap-2'>
                  <Input
                    type='color'
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className='h-10 w-16 cursor-pointer rounded-xl border-border bg-card p-1'
                  />
                  <span className='text-sm font-mono text-muted-foreground'>
                    {formData.color}
                  </span>
                </div>
              </div>
              <div>
                <label className='block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5'>
                  Icon Name
                </label>
                <Input
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  className={inputClass}
                  placeholder='e.g. bug, feature, ui'
                />
              </div>
            </div>
            <div className='flex justify-end gap-2 pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsModalOpen(false)}
                className='border-border text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-xl'
              >
                Cancel
              </Button>
              <Button
                type='submit'
                className='bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl'
              >
                {editingTag ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
