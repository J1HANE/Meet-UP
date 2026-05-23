import type {
  DependencyType,
  TaskDependencyResponseDto,
  TaskDependencyUpdateDto,
} from "@/types/task-service";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export const DependencyRow = ({
  dep,
  onUpdate,
  onDelete,
}: {
  dep: TaskDependencyResponseDto;
  onUpdate: (dependencyId: string, data: TaskDependencyUpdateDto) => void;
  onDelete: (dependencyId: string) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [type, setType] = useState<DependencyType>(dep.dependencyType);
  const [lag, setLag] = useState(dep.lagDays);

  const selectClass =
    "w-full border border-border rounded-xl px-3 py-2 bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

  const handleSave = () => {
    onUpdate(dep.dependsOnTaskId, { dependencyType: type, lagDays: lag });
    setEditing(false);
  };

  const handleCancel = () => {
    setType(dep.dependencyType);
    setLag(dep.lagDays);
    setEditing(false);
  };

  return (
    <div className='rounded-xl border border-border bg-muted/10 hover:bg-muted/20 transition-colors p-3 space-y-2'>
      {/* Header row — always visible */}
      <div className='flex items-center justify-between'>
        <div className='font-medium text-sm text-foreground'>
          {dep.dependsOnTaskName}
        </div>
        <div className='flex items-center gap-1'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => (editing ? handleCancel() : setEditing(true))}
            className='h-7 px-2 text-xs text-muted-foreground hover:text-foreground rounded-lg'
          >
            {editing ? "Cancel" : "Edit"}
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onDelete(dep.dependsOnTaskId)}
            className='h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg'
          >
            <Trash2 className='h-3.5 w-3.5' />
          </Button>
        </div>
      </div>

      {/* Inline edit form */}
      {editing ? (
        <div className='space-y-2 pt-1'>
          <div>
            <Label className='text-xs text-muted-foreground'>
              Dependency type
            </Label>
            <select
              className={cn(selectClass, "mt-1")}
              value={type}
              onChange={(e) => setType(e.target.value as DependencyType)}
            >
              <option value='FINISH_TO_START'>Finish → Start</option>
              <option value='START_TO_START'>Start → Start</option>
              <option value='FINISH_TO_FINISH'>Finish → Finish</option>
              <option value='START_TO_FINISH'>Start → Finish</option>
            </select>
          </div>
          <div>
            <Label className='text-xs text-muted-foreground'>Lag days</Label>
            <Input
              type='number'
              min={0}
              value={lag}
              onChange={(e) => setLag(Number(e.target.value))}
              className='border-border rounded-xl bg-card mt-1'
            />
          </div>
          <Button
            size='sm'
            onClick={handleSave}
            className='w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl'
          >
            Save
          </Button>
        </div>
      ) : (
        /* Read-only summary */
        <div className='text-xs text-muted-foreground flex gap-2'>
          <span>{dep.dependencyType.replace(/_/g, " ")}</span>
          {dep.lagDays > 0 && <span>· {dep.lagDays}d lag</span>}
        </div>
      )}
    </div>
  );
};
