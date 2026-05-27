import { AiInsight } from "@/types/ai-service";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function pluckProperty<T, K extends keyof T>(
  items: T[],
  property: K,
): T[K][] {
  return items.map((item) => item[property]);
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

export const getSeverityStyles = (severity: string): string => {
  switch (severity) {
    case "HIGH":
      return "bg-destructive/20 text-destructive border-destructive/30";
    case "MEDIUM":
      return "bg-chart-4/20 text-chart-4 border-chart-4/30";
    case "LOW":
      return "bg-chart-2/20 text-chart-2 border-chart-2/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export const priorityColors = {
  LOW: "bg-blue-100 text-blue-800",
  NORMAL: "bg-green-100 text-green-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
};

export const statusColors = {
  IN_BACKLOG: "bg-gray-100 text-gray-800",
  ASSIGNED: "bg-purple-100 text-purple-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  BLOCKED: "bg-red-100 text-red-800",
  IN_REVIEW: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

export const visibilityIcons = {
  PUBLIC: "Globe",
  PRIVATE: "Lock",
  GROUP: "Users",
};

export const BOARD_COLUMNS = [
  {
    id: "ASSIGNED",
    title: "Assigned",
    color: "bg-purple-50 border-purple-200",
  },
  {
    id: "IN_PROGRESS",
    title: "In Progress",
    color: "bg-blue-50 border-blue-200",
  },
  { id: "BLOCKED", title: "Blocked", color: "bg-red-50 border-red-200" },
  {
    id: "IN_REVIEW",
    title: "In Review",
    color: "bg-yellow-50 border-yellow-200",
  },
  {
    id: "COMPLETED",
    title: "Completed",
    color: "bg-green-50 border-green-200",
  },
  { id: "CANCELLED", title: "Cancelled", color: "bg-gray-50 border-gray-200" },
];
