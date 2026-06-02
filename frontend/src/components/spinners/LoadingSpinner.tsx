import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  label?: string;
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  fullScreen = false,
  label,
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  const spinner = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className,
      )}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-t-transparent border-primary",
          sizeClasses[size],
        )}
        role='status'
        aria-label={label || "Loading"}
      >
        <span className='sr-only'>{label || "Loading..."}</span>
      </div>
      {label && <p className='text-sm text-muted-foreground'>{label}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className='fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50'>
        {spinner}
      </div>
    );
  }

  return spinner;
}
