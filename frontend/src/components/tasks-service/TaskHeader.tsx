import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  ListTodo,
  BarChart3,
  Tag,
  Layers,
  GanttChartSquare,
  Menu,
  X,
  Lightbulb,
  ChevronDown,
  Video,
  Check,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "@tanstack/react-router";
import { useMeetingStore } from "@/store/meetingStore";

interface HeaderProps {
  userId?: string;
  userName?: string;
}

export const TaskHeader = ({ userId, userName }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [meetingDropdownOpen, setMeetingDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    meetings,
    meetingsLoading,
    selectedMeeting,
    fetchMeetings,
    selectMeeting,
  } = useMeetingStore();

  // Fetch meetings on mount
  useEffect(() => {
    fetchMeetings(userId, userName);
  }, [fetchMeetings, userId, userName]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setMeetingDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navItems = [
    {
      id: "tasks/backlog",
      label: "Backlog",
      icon: ListTodo,
      path: "/tasks/backlog",
    },
    {
      id: "tasks/board",
      label: "Task Board",
      icon: LayoutDashboard,
      path: "/tasks/board",
    },
    {
      id: "tasks/gantt",
      label: "Gantt Chart",
      icon: GanttChartSquare,
      path: "/tasks/gantt",
    },
    {
      id: "tasks/statistics",
      label: "Statistics",
      icon: BarChart3,
      path: "/tasks/statistics",
    },
    { id: "tasks/tags", label: "Tags", icon: Tag, path: "/tasks/tags" },
    {
      id: "tasks/categories",
      label: "Categories",
      icon: Layers,
      path: "/tasks/categories",
    },
    {
      id: "tasks/insights",
      label: "Insights",
      icon: Lightbulb,
      path: "/tasks/insights",
    },
  ];

  const handleNav = (path: string) => {
    navigate({ to: path });
    setMobileMenuOpen(false);
  };

  const handleSelectMeeting = (meeting: (typeof meetings)[number]) => {
    selectMeeting(meeting);
    setMeetingDropdownOpen(false);
  };

  const MeetingSelector = () => (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setMeetingDropdownOpen((v) => !v)}
        className={`
          flex items-center gap-2 h-8 px-3 rounded-full border text-xs font-medium
          transition-all duration-200 min-w-0 max-w-[220px]
          ${
            selectedMeeting
              ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
              : "border-border bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/60"
          }
        `}
      >
        {meetingsLoading ? (
          <Loader2 className='h-3.5 w-3.5 shrink-0 animate-spin' />
        ) : (
          <Video className='h-3.5 w-3.5 shrink-0' />
        )}
        <span className='truncate'>
          {selectedMeeting ? selectedMeeting.title : "Select a meeting"}
        </span>
        <ChevronDown
          className={`h-3 w-3 shrink-0 transition-transform duration-200 ${
            meetingDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {meetingDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className='absolute left-0 top-10 z-50 w-64 rounded-xl border border-border bg-card shadow-lg shadow-black/10 overflow-hidden'
          >
            {/* Header */}
            <div className='px-3 py-2 border-b border-border bg-muted/30'>
              <p className='text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>
                Your Meetings
              </p>
            </div>

            {/* List */}
            <div className='max-h-60 overflow-y-auto py-1'>
              {meetingsLoading ? (
                <div className='flex items-center justify-center py-6 gap-2 text-muted-foreground'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  <span className='text-xs'>Loading meetings…</span>
                </div>
              ) : meetings.length === 0 ? (
                <div className='py-6 px-3 text-center'>
                  <Video className='h-6 w-6 mx-auto mb-2 text-muted-foreground/50' />
                  <p className='text-xs text-muted-foreground'>
                    No meetings yet
                  </p>
                </div>
              ) : (
                meetings.map((meeting) => {
                  const isSelected = selectedMeeting?.id === meeting.id;
                  return (
                    <button
                      key={meeting.id}
                      onClick={() => handleSelectMeeting(meeting)}
                      className={`
                        w-full flex items-center gap-2.5 px-3 py-2.5 text-left
                        transition-colors duration-150 text-sm
                        ${
                          isSelected
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted/50"
                        }
                      `}
                    >
                      <div
                        className={`
                        h-7 w-7 rounded-lg flex items-center justify-center shrink-0
                        ${isSelected ? "bg-primary/20" : "bg-muted"}
                      `}
                      >
                        <Video
                          className={`h-3.5 w-3.5 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='truncate text-xs font-medium leading-tight'>
                          {meeting.title}
                        </p>
                        {meeting.scheduledAt && (
                          <p className='text-[10px] text-muted-foreground mt-0.5'>
                            {new Date(meeting.scheduledAt).toLocaleDateString(
                              undefined,
                              { month: "short", day: "numeric" },
                            )}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <Check className='h-3.5 w-3.5 shrink-0 text-primary' />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <header className='sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md'>
      <div className='w-full px-6'>
        <div className='flex h-16 items-center justify-between gap-4'>
          {/* Left: Meeting selector */}
          <div className='flex items-center gap-3 min-w-0'>
            <MeetingSelector />
          </div>

          {/* Desktop Nav */}
          <nav className='hidden lg:flex items-center gap-0.5'>
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Button
                  key={item.id}
                  variant='ghost'
                  size='sm'
                  onClick={() => handleNav(item.path)}
                  className={`gap-1.5 h-8 px-3 text-xs font-medium rounded-full transition-all ${
                    active
                      ? "bg-primary/15 text-primary hover:bg-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <item.icon className='h-3.5 w-3.5' />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* Tablet: icon-only nav */}
          <nav className='hidden md:flex lg:hidden items-center gap-0.5'>
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Button
                  key={item.id}
                  variant='ghost'
                  size='icon'
                  onClick={() => handleNav(item.path)}
                  title={item.label}
                  className={`h-9 w-9 rounded-full transition-all ${
                    active
                      ? "bg-primary/15 text-primary hover:bg-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <item.icon className='h-4 w-4' />
                </Button>
              );
            })}
          </nav>

          {/* Mobile hamburger */}
          <Button
            variant='ghost'
            size='icon'
            className='md:hidden h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50'
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label='Toggle menu'
          >
            {mobileMenuOpen ? (
              <X className='h-5 w-5' />
            ) : (
              <Menu className='h-5 w-5' />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className='md:hidden border-t border-border bg-card overflow-hidden'
          >
            <div className='px-4 py-3 space-y-1'>
              {/* Mobile meeting selector */}
              <div className='mb-3 pb-3 border-b border-border'>
                <p className='text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2'>
                  Active Meeting
                </p>
                {meetingsLoading ? (
                  <div className='flex items-center gap-2 text-muted-foreground text-xs'>
                    <Loader2 className='h-3.5 w-3.5 animate-spin' />
                    Loading…
                  </div>
                ) : meetings.length === 0 ? (
                  <p className='text-xs text-muted-foreground'>
                    No meetings available
                  </p>
                ) : (
                  <div className='space-y-1'>
                    {meetings.map((meeting) => {
                      const isSelected = selectedMeeting?.id === meeting.id;
                      return (
                        <button
                          key={meeting.id}
                          onClick={() => {
                            handleSelectMeeting(meeting);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                            isSelected
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                          }`}
                        >
                          <Video className='h-3.5 w-3.5 shrink-0' />
                          <span className='flex-1 truncate text-xs font-medium text-left'>
                            {meeting.title}
                          </span>
                          {isSelected && (
                            <Check className='h-3.5 w-3.5 shrink-0' />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Nav items */}
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                    }`}
                  >
                    <item.icon className='h-4 w-4 shrink-0' />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
