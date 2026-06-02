import { Video } from "lucide-react";
import { TaskHeader } from "./TaskHeader";

interface NotReadyProps {
  userId?: string;
  userName?: string;
  title?: string;
  description?: string;
}

export function NotReadyPage({
  userId,
  userName,
  title = "No meeting selected",
  description = "Select a meeting from the dropdown above to manage its tags.",
}: NotReadyProps) {
  return (
    <div className='min-h-screen bg-background'>
      <TaskHeader userId={userId} userName={userName} />
      <div className='flex flex-col items-center justify-center py-32 gap-4 text-center px-4'>
        <div className='flex h-16 w-16 items-center justify-center rounded-full bg-muted/30 border border-border'>
          <Video className='h-7 w-7 text-muted-foreground' />
        </div>
        <div>
          <p className='font-semibold text-foreground'>{title}</p>
          <p className='text-sm text-muted-foreground mt-1 max-w-xs'>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
