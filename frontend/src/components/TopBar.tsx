import { Search, Bell, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function TopBar() {
  const { user } = useAuth();
  return (
    <header className="h-16 border-b border-border bg-sidebar/50 backdrop-blur-xl sticky top-0 z-20 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search meetings, tasks, people..."
            className="w-full h-9 pl-10 pr-4 rounded-xl bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-body"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <MessageSquare className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
        </Button>
        <div className="ml-2 w-8 h-8 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
          {(user?.displayName || "U").substring(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
