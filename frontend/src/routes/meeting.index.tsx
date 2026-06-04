import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Calendar, Plus, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateMeetingDialog } from "@/components/meeting/CreateMeetingDialog";
import { listMeetingsFromApi, type BackendMeetingResponse } from "@/lib/api/meetings";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export const Route = createFileRoute("/meeting/")({
  component: MeetingLandingPage,
});

function MeetingLandingPage() {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email || "Meeting User";
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: meetings = [], isLoading, isError, error } = useQuery({
    queryKey: ["meetings", user?.id],
    queryFn: () => listMeetingsFromApi(user?.id, displayName),
    enabled: Boolean(user?.id),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="rounded-[2rem] border border-border bg-card p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">Meeting Room</h1>
              <p className="text-sm text-muted-foreground">
                Choose an existing meeting to open the live room, or schedule a new one.
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              if (!user?.id) return;
              setCreateDialogOpen(true);
            }}
            disabled={!user?.id}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New meeting
          </Button>
        </div>
      </div>

      {user?.id && (
        <CreateMeetingDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          userId={user.id}
          displayName={displayName}
        />
      )}

      {!user?.id && (
        <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Sign in to create and open meetings.
        </div>
      )}

      {isLoading && (
        <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Loading meetings...
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load meetings"}
        </div>
      )}

      {!isLoading && !isError && meetings.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          No meetings yet. Click New meeting to schedule one.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {meetings.map((meeting: BackendMeetingResponse) => (
          <div key={meeting.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="font-heading text-lg font-semibold text-foreground">{meeting.title}</h2>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(meeting.scheduledAt).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Status: {meeting.status}
                  {meeting.participants.length > 0 &&
                    ` · ${meeting.participants.length} participant${meeting.participants.length === 1 ? "" : "s"}`}
                </p>
              </div>
              <Button asChild size="sm" className="gap-2">
                <Link to="/meeting/$id" params={{ id: meeting.id }}>
                  Open <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
