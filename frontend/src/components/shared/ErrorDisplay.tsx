import { AlertCircle, RefreshCw, WifiOff, Server, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  error?: Error | string | null;
  variant?: "default" | "network" | "server" | "unauthorized";
  onRetry?: () => void;
  retryLabel?: string;
  showDetails?: boolean;
  className?: string;
}

const variantConfig = {
  default: {
    icon: AlertCircle,
    title: "Something went wrong",
    message: "An unexpected error occurred. Please try again.",
  },
  network: {
    icon: WifiOff,
    title: "Network Error",
    message:
      "Unable to connect to the server. Please check your internet connection.",
  },
  server: {
    icon: Server,
    title: "Server Error",
    message: "The server encountered an error. Please try again later.",
  },
  unauthorized: {
    icon: Lock,
    title: "Access Denied",
    message: "You don't have permission to view this content.",
  },
};

export function ErrorDisplay({
  title,
  message,
  error,
  variant = "default",
  onRetry,
  retryLabel = "Try Again",
  showDetails = false,
  className,
}: ErrorDisplayProps) {
  const config = variantConfig[variant];
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;
  const IconComponent = config.icon;

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : null;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 gap-4 text-center px-4",
        className,
      )}
    >
      <div className='flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20'>
        <IconComponent className='h-7 w-7 text-destructive' />
      </div>
      <div>
        <p className='font-semibold text-foreground text-lg'>{displayTitle}</p>
        <p className='text-sm text-muted-foreground mt-1 max-w-md'>
          {displayMessage}
        </p>
        {showDetails && errorMessage && (
          <p className='text-xs text-muted-foreground mt-3 max-w-md font-mono bg-muted/30 p-2 rounded'>
            {errorMessage}
          </p>
        )}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className='mt-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
        >
          <RefreshCw className='h-4 w-4' />
          {retryLabel}
        </button>
      )}
    </div>
  );
}
