import { Inbox, Search, FolderOpen, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

interface NoDataProps {
  title?: string;
  description?: string;
  icon?: "inbox" | "search" | "folder" | "file";
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const iconMap = {
  inbox: Inbox,
  search: Search,
  folder: FolderOpen,
  file: FileQuestion,
};

export function NoData({
  title = "No data found",
  description = "We couldn't find any matching records.",
  icon = "inbox",
  action,
  className,
}: NoDataProps) {
  const IconComponent = iconMap[icon];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 gap-4 text-center px-4",
        className,
      )}
    >
      <div className='flex h-16 w-16 items-center justify-center rounded-full bg-muted/30 border border-border'>
        <IconComponent className='h-7 w-7 text-muted-foreground' />
      </div>
      <div>
        <p className='font-semibold text-foreground'>{title}</p>
        <p className='text-sm text-muted-foreground mt-1 max-w-xs'>
          {description}
        </p>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className='mt-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
