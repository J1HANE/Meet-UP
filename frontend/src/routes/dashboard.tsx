import CollaborationAnimation from "@/components/animations/CollaborationAnimation";
import UserAvatar from "@/components/shared/UserAvatar";
import { useAuth } from "@/hooks/useAuth";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckSquare,
  ListTodo,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuth();
  return (
    <div className='min-h-screen bg-background text-foreground'>
      {/* Simple Header */}
      <header className='border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-10'>
        <div className='container mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='neon-dot'></div>
              <span className='text-xl font-bold font-heading text-primary'>
                meetup!
              </span>
            </div>
            <div className='flex items-center gap-4'>
              <div className='text-right hidden sm:block'>
                <p className='text-sm font-medium'>{user?.displayName}</p>
                <p className='text-xs text-muted-foreground'>{user?.email}</p>
              </div>
              <div className='w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center'>
                {user?.displayName && (
                  <UserAvatar
                    name={user?.displayName}
                    avatarUrl={user?.avatarUrl}
                    size='md'
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='container mx-auto px-6 py-8'>
        {/* Welcome Section */}
        <div className='mb-10'>
          <h1 className='text-3xl sm:text-4xl font-bold font-heading mb-2'>
            Welcome back,{" "}
            <span className='text-primary'>{user?.displayName}</span>!
          </h1>
          <p className='text-muted-foreground'>
            Ready to collaborate? Here's what you can do today.
          </p>
        </div>

        {/* Navigation Cards Grid */}
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {/* Meetings Card */}
          <Link
            to='/meeting'
            className='group glass-panel rounded-xl p-6 hover:glow-border transition-all duration-300 block'
          >
            <div className='w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors'>
              <Video size={24} className='text-primary' />
            </div>
            <h2 className='text-xl font-semibold font-heading mb-2'>
              Meetings
            </h2>
            <p className='text-muted-foreground text-sm mb-4'>
              Join or start video calls, chat with your team, and share your
              screen in real-time.
            </p>
            <div className='flex items-center gap-1 text-primary text-sm font-medium'>
              Go to meetings
              <ArrowRight
                size={16}
                className='group-hover:translate-x-1 transition-transform'
              />
            </div>
          </Link>
          {/* Tasks Backlog Card */}
          <Link
            to='/tasks/backlog'
            className='group glass-panel rounded-xl p-6 hover:glow-border transition-all duration-300 block'
          >
            <div className='w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors'>
              <CheckSquare size={24} className='text-primary' />
            </div>
            <h2 className='text-xl font-semibold font-heading mb-2'>
              Task Backlog
            </h2>
            <p className='text-muted-foreground text-sm mb-4'>
              Manage your backlog, track progress, update task status, and see
              what's next.
            </p>
            <div className='flex items-center gap-1 text-primary text-sm font-medium'>
              View backlog
              <ArrowRight
                size={16}
                className='group-hover:translate-x-1 transition-transform'
              />
            </div>
          </Link>
          {/* Groups Card */}
          <Link
            to='/groups'
            className='group glass-panel rounded-xl p-6 hover:glow-border transition-all duration-300 block'
          >
            <div className='w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors'>
              <Users size={24} className='text-primary' />
            </div>
            <h2 className='text-xl font-semibold font-heading mb-2'>Groups</h2>
            <p className='text-muted-foreground text-sm mb-4'>
              See your active task groups — automatically created and dissolved
              as you work.
            </p>
            <div className='flex items-center gap-1 text-primary text-sm font-medium'>
              Browse groups
              <ArrowRight
                size={16}
                className='group-hover:translate-x-1 transition-transform'
              />
            </div>
          </Link>
          {/* Summary Card */}
          <Link
            to='/summary'
            className='group glass-panel rounded-xl p-6 hover:glow-border transition-all duration-300 block'
          >
            <div className='w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors'>
              <BarChart3 size={24} className='text-primary' />
            </div>
            <h2 className='text-xl font-semibold font-heading mb-2'>Summary</h2>
            <p className='text-muted-foreground text-sm mb-4'>
              View meeting summary and get AI-powered insights about your work.
            </p>
            <div className='flex items-center gap-1 text-primary text-sm font-medium'>
              See insights
              <ArrowRight
                size={16}
                className='group-hover:translate-x-1 transition-transform'
              />
            </div>
          </Link>
        </div>

        <CollaborationAnimation />
      </main>
    </div>
  );
}
