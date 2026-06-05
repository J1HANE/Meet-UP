import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { LoaderCircle, Plus, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  addParticipantApi,
  createMeetingApi,
  isUuid,
} from "@/lib/api/meetings";

const DEFAULT_TWEEN_ID = "00000000-0000-4000-8000-000000000001";

const inputClass =
  "rounded-xl border-border bg-background text-foreground focus-visible:ring-primary/50";

type MemberDraft = {
  key: string;
  userName: string;
  userId: string;
};

type CreateMeetingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  displayName: string;
};

function defaultScheduledLocalValue() {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function newMemberRow(): MemberDraft {
  return { key: crypto.randomUUID(), userName: "", userId: "" };
}

export function CreateMeetingDialog({
  open,
  onOpenChange,
  userId,
  displayName,
}: CreateMeetingDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [scheduledAt, setScheduledAt] = useState(defaultScheduledLocalValue);
  const [members, setMembers] = useState<MemberDraft[]>([newMemberRow()]);
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle("");
    setScheduledAt(defaultScheduledLocalValue());
    setMembers([newMemberRow()]);
    setFormError(null);
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        throw new Error("Meeting name is required.");
      }

      const scheduledDate = new Date(scheduledAt);
      if (Number.isNaN(scheduledDate.getTime())) {
        throw new Error("Please choose a valid date and time.");
      }
      if (scheduledDate.getTime() <= Date.now()) {
        throw new Error("Meeting time must be in the future.");
      }

      const meeting = await createMeetingApi(
        {
          title: trimmedTitle,
          tweenId: DEFAULT_TWEEN_ID,
          createdBy: userId,
          scheduledAt: scheduledDate.toISOString(),
          createStreamCall: true,
        },
        userId,
        displayName,
      );

      const participants = members
        .map((member) => {
          const name = member.userName.trim();
          if (!name) return null;
          const id = member.userId.trim();
          const resolvedId = id && isUuid(id) ? id : crypto.randomUUID();
          return { userId: resolvedId, userName: name };
        })
        .filter((member): member is { userId: string; userName: string } => member !== null)
        .filter((member) => member.userId !== userId);

      for (const participant of participants) {
        await addParticipantApi(
          meeting.id,
          { userId: participant.userId, userName: participant.userName },
          userId,
          displayName,
        );
      }

      return meeting;
    },
    onSuccess: (meeting) => {
      queryClient.invalidateQueries({ queryKey: ["meetings", userId] });
      resetForm();
      onOpenChange(false);
      navigate({ to: "/meeting/$id", params: { id: meeting.id } });
    },
    onError: (error) => {
      setFormError(error instanceof Error ? error.message : "Failed to create meeting");
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !createMutation.isPending) {
      resetForm();
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg rounded-[2rem] border-border bg-card">
        <DialogHeader>
          <DialogTitle className="font-heading text-foreground">New meeting</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Meeting name *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              placeholder="e.g. Sprint planning"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Date & time *
            </label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Members
              </label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-xl"
                onClick={() => setMembers((rows) => [...rows, newMemberRow()])}
              >
                <Plus className="h-3.5 w-3.5" />
                Add member
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">You are added as host automatically. Add teammates by name (email optional).</p>

            <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
              {members.map((member, index) => (
                <div
                  key={member.key}
                  className="flex gap-2 rounded-xl border border-border/60 bg-muted/10 p-2"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
                    <Input
                      value={member.userName}
                      onChange={(e) =>
                        setMembers((rows) =>
                          rows.map((row) =>
                            row.key === member.key
                              ? { ...row, userName: e.target.value }
                              : row,
                          ),
                        )
                      }
                      className={inputClass}
                      placeholder="Display name"
                    />
                    <Input
                      value={member.userId}
                      onChange={(e) =>
                        setMembers((rows) =>
                          rows.map((row) =>
                            row.key === member.key
                              ? { ...row, userId: e.target.value }
                              : row,
                          ),
                        )
                      }
                      className={inputClass}
                      placeholder="Email (optional)"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    disabled={members.length === 1}
                    onClick={() =>
                      setMembers((rows) => rows.filter((row) => row.key !== member.key))
                    }
                    aria-label={`Remove member ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {formError && (
            <p className="text-sm text-destructive">{formError}</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              disabled={createMutation.isPending}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="gap-2 rounded-xl"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create meeting
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
