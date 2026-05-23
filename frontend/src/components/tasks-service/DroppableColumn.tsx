import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";

interface DroppableColumnProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const DroppableColumn: React.FC<DroppableColumnProps> = ({
  id,
  children,
  className,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-1 p-3 space-y-2.5 overflow-y-auto transition-colors duration-150",
        isOver && "bg-primary/5 rounded-b-[1.5rem]",
        className,
      )}
    >
      {children}
    </div>
  );
};
