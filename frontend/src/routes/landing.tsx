import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bot,
  CheckSquare,
  Clock,
  ListTodo,
  Menu,
  MessageSquare,
  Share2,
  Sparkles,
  Star,
  Users,
  Video,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/landing")({
  component: RouteComponent,
});

function RouteComponent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className='min-h-screen bg-background text-foreground'>
      {/* Navigation */}
      <nav className='fixed top-0 w-full z-50 glass-panel border-b border-border/50'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <div className='flex items-center gap-2'>
              <div className='neon-dot'></div>
              <span className='text-xl font-bold font-heading bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'>
                meetup!
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className='hidden md:flex items-center gap-6'>
              <a
                href='#features'
                className='text-muted-foreground hover:text-foreground transition-colors'
              >
                Features
              </a>
              <a
                href='#how-it-works'
                className='text-muted-foreground hover:text-foreground transition-colors'
              >
                How it works
              </a>
              <a
                href='#insights'
                className='text-muted-foreground hover:text-foreground transition-colors'
              >
                Insights
              </a>
            </div>

            <div className='hidden md:flex items-center gap-3'>
              <Link
                to='/login'
                className='px-4 py-2 rounded-lg text-foreground hover:bg-secondary transition-colors'
              >
                Log in
              </Link>

              <Link
                to='/register'
                className='px-5 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all glow-border'
              >
                Register
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className='md:hidden p-2 rounded-lg hover:bg-secondary transition-colors'
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className='md:hidden glass-panel border-t border-border'>
            <div className='px-4 py-3 space-y-3'>
              <a
                href='#features'
                className='block py-2 text-muted-foreground hover:text-foreground'
              >
                Features
              </a>
              <a
                href='#how-it-works'
                className='block py-2 text-muted-foreground hover:text-foreground'
              >
                How it works
              </a>
              <a
                href='#insights'
                className='block py-2 text-muted-foreground hover:text-foreground'
              >
                Insights
              </a>
              <div className='pt-3 flex gap-3'>
                <Link
                  to='/login'
                  className='flex-1 px-4 py-2 rounded-lg text-foreground hover:bg-secondary transition-colors'
                >
                  Log in
                </Link>

                <Link
                  to='/register'
                  className='flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90'
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className='relative pt-32 pb-20 overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none' />
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center max-w-4xl mx-auto'>
            <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6'>
              <Sparkles size={14} className='text-primary' />
              <span className='text-sm font-medium text-primary'>
                AI-Powered Collaboration
              </span>
            </div>
            <h1 className='text-5xl sm:text-6xl lg:text-7xl font-bold font-heading mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent'>
              Meetings that transform into action
            </h1>
            <p className='text-xl text-muted-foreground mb-10 max-w-2xl mx-auto'>
              Video calls, chat, screen sharing, and dynamic project management
              — all in one intelligent platform. Groups form and dissolve
              automatically around tasks.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <button className='px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all glow-border inline-flex items-center gap-2 justify-center group'>
                <Link to='/login'>Get started free</Link>
                <ArrowRight
                  size={18}
                  className='group-hover:translate-x-1 transition-transform'
                />
              </button>
              <button className='px-8 py-3 rounded-xl glass-panel border-border text-foreground font-medium hover:bg-secondary transition-colors inline-flex items-center gap-2 justify-center'>
                Watch demo
              </button>
            </div>

            {/* Hero Stats */}
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 pt-8 border-t border-border'>
              <div>
                <div className='text-2xl font-bold font-heading text-primary'>
                  5k+
                </div>
                <div className='text-sm text-muted-foreground'>
                  Active Teams
                </div>
              </div>
              <div>
                <div className='text-2xl font-bold font-heading text-primary'>
                  120k+
                </div>
                <div className='text-sm text-muted-foreground'>
                  Meetings Hosted
                </div>
              </div>
              <div>
                <div className='text-2xl font-bold font-heading text-primary'>
                  98%
                </div>
                <div className='text-sm text-muted-foreground'>
                  Satisfaction
                </div>
              </div>
              <div>
                <div className='text-2xl font-bold font-heading text-primary'>
                  2.5x
                </div>
                <div className='text-sm text-muted-foreground'>
                  Faster Delivery
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id='features' className='py-20 gradient-surface'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl sm:text-4xl font-bold font-heading mb-4'>
              Everything you need,{" "}
              <span className='text-primary'>intelligently connected</span>
            </h2>
            <p className='text-muted-foreground max-w-2xl mx-auto'>
              Meetup! combines real-time communication with dynamic project
              management that adapts to your workflow.
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {features.map((feature, idx) => (
              <div
                key={idx}
                className='glass-panel rounded-xl p-6 hover:glow-border transition-all duration-300 group'
              >
                <div className='w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors'>
                  <feature.icon size={24} className='text-primary' />
                </div>
                <h3 className='text-xl font-semibold font-heading mb-2'>
                  {feature.title}
                </h3>
                <p className='text-muted-foreground'>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id='how-it-works' className='py-20'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl sm:text-4xl font-bold font-heading mb-4'>
              Dynamic groups that{" "}
              <span className='text-primary'>live with your tasks</span>
            </h2>
            <p className='text-muted-foreground max-w-2xl mx-auto'>
              Groups are automatically created when a task is created and
              dissolve when the meeting ends — perfect for agile teams.
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            {steps.map((step, idx) => (
              <div key={idx} className='text-center relative'>
                <div className='w-16 h-16 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-4'>
                  <span className='text-2xl font-bold text-primary'>
                    {idx + 1}
                  </span>
                </div>
                <h3 className='text-xl font-semibold font-heading mb-2'>
                  {step.title}
                </h3>
                <p className='text-muted-foreground'>{step.description}</p>
                {idx < 2 && (
                  <div className='hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gradient-to-r from-primary/50 to-transparent' />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Project Management Preview */}
      <section className='py-20 gradient-surface'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid lg:grid-cols-2 gap-12 items-center'>
            <div>
              <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4'>
                <ListTodo size={14} className='text-primary' />
                <span className='text-sm font-medium text-primary'>
                  Project Management
                </span>
              </div>
              <h2 className='text-3xl sm:text-4xl font-bold font-heading mb-4'>
                Backlog · Board · Gantt ·{" "}
                <span className='text-primary'>Statistics</span>
              </h2>
              <p className='text-muted-foreground mb-6'>
                Full project management suite that integrates seamlessly with
                your meetings. Track tasks, visualize progress with Gantt
                charts, and get powerful statistics — all in one place.
              </p>
              <div className='flex flex-wrap gap-3'>
                {["Backlog", "Kanban Board", "Gantt Chart", "Analytics"].map(
                  (item) => (
                    <span
                      key={item}
                      className='px-3 py-1 rounded-full bg-secondary text-sm'
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>
            <div className='relative'>
              <div className='glass-panel rounded-xl p-4'>
                <div className='flex gap-2 mb-4'>
                  <div className='w-3 h-3 rounded-full bg-destructive'></div>
                  <div className='w-3 h-3 rounded-full bg-primary'></div>
                  <div className='w-3 h-3 rounded-full bg-muted-foreground'></div>
                </div>
                <div className='space-y-3'>
                  {[
                    {
                      status: "in-progress",
                      title: "Implement video chat UI",
                      progress: 75,
                    },
                    {
                      status: "review",
                      title: "Screen sharing feature",
                      progress: 90,
                    },
                    {
                      status: "todo",
                      title: "Task group auto-dissolve",
                      progress: 30,
                    },
                    {
                      status: "done",
                      title: "User authentication",
                      progress: 100,
                    },
                  ].map((task, i) => (
                    <div key={i} className='flex items-center gap-3'>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          task.status === "in-progress"
                            ? "bg-primary"
                            : task.status === "review"
                              ? "bg-accent"
                              : task.status === "todo"
                                ? "bg-muted-foreground"
                                : "bg-chart-4"
                        }`}
                      ></div>
                      <span className='flex-1 text-sm'>{task.title}</span>
                      <span className='text-xs text-muted-foreground'>
                        {task.progress}%
                      </span>
                      <div className='w-20 h-1.5 bg-secondary rounded-full overflow-hidden'>
                        <div
                          className={`h-full rounded-full ${
                            task.status === "in-progress"
                              ? "bg-primary"
                              : task.status === "review"
                                ? "bg-accent"
                                : task.status === "todo"
                                  ? "bg-muted-foreground"
                                  : "bg-chart-4"
                          }`}
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Decorative elements */}
              <div className='absolute -bottom-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-2xl -z-10'></div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Insights & Recommendations */}
      <section id='insights' className='py-20'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4'>
              <Bot size={14} className='text-primary' />
              <span className='text-sm font-medium text-primary'>
                AI-Powered
              </span>
            </div>
            <h2 className='text-3xl sm:text-4xl font-bold font-heading mb-4'>
              Smart insights &{" "}
              <span className='text-primary'>actionable recommendations</span>
            </h2>
            <p className='text-muted-foreground max-w-2xl mx-auto'>
              Our AI analyzes meeting patterns and task progress to deliver
              personalized insights that boost productivity.
            </p>
          </div>

          <div className='grid md:grid-cols-2 gap-8'>
            <div className='glass-panel rounded-xl p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='live-dot'></div>
                <span className='text-sm font-medium text-chart-4'>
                  Live Meeting Insights
                </span>
              </div>
              <div className='space-y-4'>
                <div className='p-3 rounded-lg bg-secondary/50'>
                  <p className='text-sm font-medium mb-1'>
                    Speaking time distribution
                  </p>
                  <div className='flex gap-2 text-xs text-muted-foreground'>
                    <span>Alex: 42%</span>
                    <span>Sarah: 28%</span>
                    <span>Mike: 30%</span>
                  </div>
                </div>
                <div className='p-3 rounded-lg bg-secondary/50'>
                  <p className='text-sm font-medium mb-1'>Recommendation</p>
                  <p className='text-sm text-muted-foreground'>
                    Consider shorter check-ins. The last 3 meetings averaged 15
                    minutes over schedule.
                  </p>
                </div>
                <div className='p-3 rounded-lg bg-secondary/50'>
                  <p className='text-sm font-medium mb-1'>
                    Action items detected
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    "Update API docs" - assigned to @mike • "Review Q1 roadmap"
                    - assigned to @sarah
                  </p>
                </div>
              </div>
            </div>

            <div className='glass-panel rounded-xl p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <Zap size={16} className='text-primary' />
                <span className='text-sm font-medium'>
                  Productivity Recommendations
                </span>
              </div>
              <div className='space-y-4'>
                <div className='flex items-start gap-3'>
                  <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0'>
                    <Clock size={16} className='text-primary' />
                  </div>
                  <div>
                    <p className='font-medium'>Best meeting times</p>
                    <p className='text-sm text-muted-foreground'>
                      Your team is most collaborative on Tuesdays 10-11 AM
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <div className='w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0'>
                    <Users size={16} className='text-accent' />
                  </div>
                  <div>
                    <p className='font-medium'>Group dynamic alert</p>
                    <p className='text-sm text-muted-foreground'>
                      Task "Frontend review" needs attention — 3 days overdue
                    </p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <div className='w-8 h-8 rounded-lg bg-chart-4/10 flex items-center justify-center shrink-0'>
                    <Star size={16} className='text-chart-4' />
                  </div>
                  <div>
                    <p className='font-medium'>Success pattern</p>
                    <p className='text-sm text-muted-foreground'>
                      Teams using Gantt charts complete projects 32% faster
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 gradient-surface relative overflow-hidden'>
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.72_0.19_45/0.15),transparent)] pointer-events-none' />
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 text-center relative'>
          <h2 className='text-3xl sm:text-4xl font-bold font-heading mb-4'>
            Ready to transform your meetings?
          </h2>
          <p className='text-xl text-muted-foreground mb-8 max-w-2xl mx-auto'>
            Join thousands of teams who've replaced chaos with clarity.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button className='px-8 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all glow-border inline-flex items-center gap-2 justify-center'>
              Start free trial
              <ArrowRight size={18} />
            </button>
            <button className='px-8 py-3 rounded-xl glass-panel border-border text-foreground font-medium hover:bg-secondary transition-colors'>
              Contact sales
            </button>
          </div>
          <p className='text-sm text-muted-foreground mt-6'>
            No credit card required · Free for teams up to 5
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className='py-12 border-t border-border'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
            <div className='flex items-center gap-2'>
              <div className='neon-dot'></div>
              <span className='text-lg font-bold font-heading text-primary'>
                meetup!
              </span>
            </div>
            <div className='flex gap-6 text-sm text-muted-foreground'>
              <a href='#' className='hover:text-foreground'>
                Privacy
              </a>
              <a href='#' className='hover:text-foreground'>
                Terms
              </a>
              <a href='#' className='hover:text-foreground'>
                Security
              </a>
              <a href='#' className='hover:text-foreground'>
                Contact
              </a>
            </div>
            <div className='text-sm text-muted-foreground'>
              © 2026 meetup! — AI-first collaboration
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: Video,
    title: "HD Video Calls",
    description:
      "Crystal clear video with noise cancellation and virtual backgrounds.",
  },
  {
    icon: MessageSquare,
    title: "Team Chat",
    description:
      "Persistent channels and direct messages that sync across devices.",
  },
  {
    icon: Share2,
    title: "Screen Sharing",
    description: "Share your screen with annotation tools and remote control.",
  },
  {
    icon: CheckSquare,
    title: "Task Management",
    description:
      "Backlog, board, Gantt, and statistics for complete project visibility.",
  },
  {
    icon: Users,
    title: "Dynamic Groups",
    description:
      "Groups auto-create with tasks and dissolve when tasks are completed.",
  },
  {
    icon: Sparkles,
    title: "AI Insights",
    description:
      "Smart recommendations and meeting analytics to boost productivity.",
  },
];

// Steps data
const steps = [
  {
    title: "Create a task",
    description:
      "Start by creating a task in the project management section — a group is automatically formed.",
  },
  {
    title: "Meet & collaborate",
    description:
      "Jump into video calls, chat, share screens, and track progress in real-time.",
  },
  {
    title: "Auto resolution",
    description:
      "When the meeting ends, the group dissolves. All tasks and logs are preserved.",
  },
];
