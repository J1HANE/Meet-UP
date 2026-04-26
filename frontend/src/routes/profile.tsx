import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BadgeCheck, Bell, Clock, KeyRound, ListTodo, Lock, Mail, ShieldCheck, Tag, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({
    meta: [
      { title: "Profile — MeetFlow" },
      { name: "description", content: "Your personal dashboard" },
    ],
  }),
});

const topics = [
  { label: "API Design", weight: 3 },
  { label: "Authentication", weight: 2 },
  { label: "Task Planning", weight: 3 },
  { label: "Code Review", weight: 2 },
  { label: "Security", weight: 1 },
  { label: "DevOps", weight: 2 },
  { label: "UX Research", weight: 1 },
  { label: "Performance", weight: 2 },
];

const stats = [
  { icon: Clock, label: "Meetings this month", value: "24" },
  { icon: Users, label: "Active groups", value: "4" },
  { icon: ListTodo, label: "Tasks completed", value: "18" },
];

const preferences = [
  { label: "Meeting reminders", description: "Get notified 10 minutes before every meeting.", defaultChecked: true },
  { label: "Task digest", description: "Receive a summary of assigned tasks at the end of the day.", defaultChecked: true },
  { label: "Profile visibility", description: "Show your role and expertise to collaborators.", defaultChecked: false },
];

function ProfilePage() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-[2rem] border border-primary/20 gradient-surface p-6 shadow-[0_24px_80px_oklch(0.08_0.03_280/0.45)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] gradient-accent text-3xl font-heading font-bold text-primary-foreground">
              JD
            </div>
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <BadgeCheck className="w-3.5 h-3.5" />
                Verified collaborator
              </div>
              <h1 className="text-3xl font-heading font-bold text-foreground">John Doe</h1>
              <p className="text-sm text-muted-foreground">Product Engineer · Joined Jan 2025 · Casablanca</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline">Cancel changes</Button>
            <Button className="bg-orange-500 text-slate-950 hover:bg-orange-400">Save profile</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-5 text-center">
            <stat.icon className="mx-auto mb-2 w-5 h-5 text-primary" />
            <p className="text-2xl font-heading font-bold text-foreground">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-border bg-card p-6">
            <div className="mb-5">
              <h2 className="font-heading text-xl font-semibold text-foreground">Edit profile information</h2>
              <p className="mt-1 text-sm text-muted-foreground">Update the usual personal details your teammates see across the workspace.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Full name</label>
                <Input defaultValue="John Doe" className="h-11 rounded-xl border-border/80 bg-muted/10" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Role</label>
                <Input defaultValue="Product Engineer" className="h-11 rounded-xl border-border/80 bg-muted/10" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input defaultValue="john.doe@meetflow.app" className="h-11 rounded-xl border-border/80 bg-muted/10" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Location</label>
                <Input defaultValue="Casablanca, Morocco" className="h-11 rounded-xl border-border/80 bg-muted/10" />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium text-foreground">Bio</label>
              <Textarea
                defaultValue="I help teams turn meetings into clear task plans, cleaner execution, and fewer blockers across engineering and operations."
                className="min-h-[120px] rounded-2xl border-border/80 bg-muted/10"
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-heading text-lg font-semibold text-foreground">Recurring Topics</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <motion.span
                  key={topic.label}
                  whileHover={{ scale: 1.05 }}
                  className="rounded-xl border border-border px-3 py-1.5 text-sm transition-all hover:border-primary/30 hover:bg-primary/5"
                  style={{ fontSize: `${12 + topic.weight * 2}px` }}
                >
                  {topic.label}
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <h3 className="font-heading text-lg font-semibold text-foreground">Preferences</h3>
            </div>
            <div className="space-y-4">
              {preferences.map((preference) => (
                <div key={preference.label} className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
                  <div>
                    <div className="font-medium text-foreground">{preference.label}</div>
                    <div className="text-sm text-muted-foreground">{preference.description}</div>
                  </div>
                  <Switch defaultChecked={preference.defaultChecked} />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h3 className="font-heading text-lg font-semibold text-foreground">Security</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
                <div className="flex items-center gap-3">
                  <KeyRound className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">Password</div>
                    <div className="text-sm text-muted-foreground">Last changed 21 days ago</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">Two-factor authentication</div>
                    <div className="text-sm text-muted-foreground">Currently enabled</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">Recovery email</div>
                    <div className="text-sm text-muted-foreground">john.doe@meetflow.app</div>
                  </div>
                </div>
                <Button variant="outline" size="sm">Change</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
