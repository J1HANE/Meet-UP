import { useState } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router";

interface HeaderProps {
  contextName?: string;
}

export const TaskHeader = ({ contextName }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get current page from URL pathname
  const currentPage = location.pathname.slice(1) || "backlog";

  const navItems = [
    { id: "backlog", label: "Backlog", icon: ListTodo, path: "/backlog" },
    { id: "board", label: "Task Board", icon: LayoutDashboard, path: "/board" },
    {
      id: "gantt",
      label: "Gantt Chart",
      icon: GanttChartSquare,
      path: "/gantt",
    },
    {
      id: "statistics",
      label: "Statistics",
      icon: BarChart3,
      path: "/statistics",
    },
    { id: "tags", label: "Tags", icon: Tag, path: "/tags" },
    {
      id: "categories",
      label: "Categories",
      icon: Layers,
      path: "/categories",
    },
  ];

  const handleNav = (path: string) => {
    navigate(`/${path}`);
    setMobileMenuOpen(false);
  };

  return (
    <header className='sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md'>
      <div className='w-full px-6'>
        <div className='flex h-16 items-center justify-between gap-4'>
          {/* Brand */}
          <div className='flex items-center gap-3 min-w-0'>
            {contextName && (
              <Badge
                variant='outline'
                className='hidden sm:inline-flex shrink-0 border-primary/30 bg-primary/10 text-primary text-xs'
              >
                {contextName}
              </Badge>
            )}
          </div>

          {/* Desktop Nav */}
          <nav className='hidden lg:flex items-center gap-0.5'>
            {navItems.map((item) => {
              const active = currentPage === item.id;
              return (
                <Button
                  key={item.id}
                  variant='ghost'
                  size='sm'
                  onClick={() => handleNav(item.id)}
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
              const active = currentPage === item.id;
              return (
                <Button
                  key={item.id}
                  variant='ghost'
                  size='icon'
                  onClick={() => handleNav(item.id)}
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
              {contextName && (
                <div className='mb-3'>
                  <Badge
                    variant='outline'
                    className='border-primary/30 bg-primary/10 text-primary text-xs'
                  >
                    {contextName}
                  </Badge>
                </div>
              )}
              {navItems.map((item) => {
                const active = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
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
