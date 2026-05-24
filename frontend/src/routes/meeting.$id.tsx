import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock3,
  FileText,
  MessageSquare,
  Send,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MeetingStreamSession } from "@/components/meeting/MeetingStreamSession";
import { chatClient, ChatMessage } from "@/lib/chat";
import {
  getMeetingByIdFromApi,
  joinMeetingApi,
  MeetingApiError,
  type BackendMeetingResponse,
} from "@/lib/api/meetings";
import {
  DEFAULT_DEV_HOST_USER_NAME,
  getMeetingUserId,
  getMeetingUserName,
  setMeetingUser,
} from "@/lib/meeting-user";

type VideoParticipant = {
  id: string;
  name: string;
  initials: string;
  role: string;
  speaking?: boolean;
  muted?: boolean;
  videoOn?: boolean;
};

type MeetingPageViewModel = {
  id: string;
  title: string;
  time: string;
  dateLabel: string;
  duration: string;
  group: string;
  status: string;
  roomLabel: string;
  participants: VideoParticipant[];
  openTasks: { title: string; done: boolean }[];
  transcriptLines: { speaker: string; text: string; time: string }[];
  summaryLinkMeetingId: string;
};

type MeetingIdentity = {
  userId: string;
  userName: string;
};

function formatMeetingDateLabel(isoDate: string) {
  const date = new Date(isoDate);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatMeetingTime(isoDate: string) {
  const date = new Date(isoDate);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toViewModelFromBackend(meeting: BackendMeetingResponse): MeetingPageViewModel {
  const uniqueParticipants = Array.from(
    new Map((meeting.participants ?? []).map((participant) => [participant.userId, participant])).values(),
  );

  return {
    id: meeting.id,
    title: meeting.title,
    time: formatMeetingTime(meeting.scheduledAt),
    dateLabel: formatMeetingDateLabel(meeting.scheduledAt),
    duration: "TBD",
    group: `Tween ${meeting.tweenId.slice(0, 8)}`,
    status: meeting.status,
    roomLabel: meeting.streamCallType ?? "Stream Call",
    participants: uniqueParticipants.map((participant) => ({
      id: participant.userId,
      name: participant.displayName,
      initials: participant.displayName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      role: participant.role === "HOST" ? "Host" : "Participant",
    })),
    openTasks: [],
    transcriptLines: [],
    summaryLinkMeetingId: meeting.id,
  };
}

function resolveMeetingIdentity(meeting: BackendMeetingResponse): MeetingIdentity {
  const storedUserId = getMeetingUserId();
  const storedUserName = getMeetingUserName();
  const storedParticipant = meeting.participants.find((participant) => participant.userId === storedUserId);

  if (storedParticipant) {
    return {
      userId: storedParticipant.userId,
      userName: storedParticipant.displayName,
    };
  }

  const looksLikeUnassignedGuest =
    !storedUserName.trim() ||
    storedUserName === "Guest" ||
    storedUserName === DEFAULT_DEV_HOST_USER_NAME;

  if (looksLikeUnassignedGuest && meeting.participants.length > 0) {
    const preferredParticipant =
      [...meeting.participants]
        .reverse()
        .find((participant) => participant.role !== "HOST") ?? meeting.participants[0];

    return {
      userId: preferredParticipant.userId,
      userName: preferredParticipant.displayName,
    };
  }

  return {
    userId: storedUserId,
    userName: storedUserName,
  };
}

export const Route = createFileRoute("/meeting/$id")({
  component: MeetingRoomPage,
  head: () => ({
    meta: [
      { title: "Meeting Room — MeetFlow" },
      { name: "description", content: "Live meeting session with real-time collaboration" },
    ],
  }),
});

function MeetingRoomPage() {
  const { id } = Route.useParams();

  const { data: backendMeeting, isLoading, isError, error } = useQuery({
    queryKey: ["meeting", id],
    queryFn: () => getMeetingByIdFromApi(id, getMeetingUserId(), getMeetingUserName()),
    retry: (failureCount, err) => {
      if (err instanceof MeetingApiError && err.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const isNotFound = error instanceof MeetingApiError && error.status === 404;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading meeting...</h1>
          <p className="mt-2 text-muted-foreground">Fetching meeting details from the backend.</p>
        </div>
      </div>
    );
  }

  if (!backendMeeting) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">Meeting not found</h1>
          <p className="mt-2 text-muted-foreground">
            {isNotFound
              ? "This meeting does not exist. Create one with POST /api/meetings (Postman), then open /meeting/{id} with the returned id."
              : isError
                ? "Could not load meeting details from the backend."
                : "The meeting you're looking for doesn't exist."}
          </p>
          <div className="mt-6 flex justify-center">
            <Button asChild variant="outline">
              <Link to="/">Back to dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const meetingViewModel = toViewModelFromBackend(backendMeeting);
  return <MeetingRoom meeting={meetingViewModel} />;
}

function MeetingRoom({ meeting }: { meeting: MeetingPageViewModel }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"chat" | "transcript">("transcript");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [identity, setIdentity] = useState<MeetingIdentity>(() => ({
    userId: getMeetingUserId(),
    userName: getMeetingUserName(),
  }));
  const [videoConfig, setVideoConfig] = useState<{
    api_key: string;
    call_id: string;
    call_type: string;
    token: string;
    user_id: string;
    user_name: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: liveMeeting } = useQuery({
    queryKey: ["meeting", meeting.id, identity.userId, identity.userName],
    queryFn: () => getMeetingByIdFromApi(meeting.id, identity.userId, identity.userName),
    refetchInterval: 2000,
  });

  const preferredIdentity = liveMeeting ? resolveMeetingIdentity(liveMeeting) : identity;
  const identityNeedsSync =
    preferredIdentity.userId !== identity.userId ||
    preferredIdentity.userName !== identity.userName;

  useEffect(() => {
    if (identityNeedsSync) {
      setMeetingUser(preferredIdentity.userId, preferredIdentity.userName);
      setIdentity(preferredIdentity);
    }
  }, [identityNeedsSync, preferredIdentity]);

  const roster = liveMeeting
    ? toViewModelFromBackend(liveMeeting).participants
    : meeting.participants;

  useEffect(() => {
    let unsubscribeChat: (() => void) | undefined;

    const connectMeeting = async () => {
      if (identityNeedsSync) {
        return;
      }

      try {
        const joinResponse = await joinMeetingApi(meeting.id, identity.userId, identity.userName);
        const displayName = joinResponse.participant.displayName || identity.userName;
        setMeetingUser(joinResponse.participant.userId, displayName);
        if (
          joinResponse.participant.userId !== identity.userId ||
          displayName !== identity.userName
        ) {
          setIdentity({
            userId: joinResponse.participant.userId,
            userName: displayName,
          });
        }

        setVideoConfig({
          api_key: joinResponse.video.api_key,
          call_id: joinResponse.video.call_id,
          call_type: joinResponse.video.call_type,
          token: joinResponse.video.token,
          user_id: joinResponse.participant.userId,
          user_name: displayName,
        });

        await queryClient.invalidateQueries({ queryKey: ["meeting", meeting.id] });
        await chatClient.connect(
          meeting.id,
          joinResponse.participant.userId,
          displayName,
          joinResponse.chat,
        );

        unsubscribeChat = chatClient.onMessages((messages) => {
          setChatMessages(messages);
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        });
      } catch (error) {
        console.error("Failed to connect meeting experience:", error);
      }
    };

    void connectMeeting();

    return () => {
      unsubscribeChat?.();
      void chatClient.disconnect();
    };
  }, [identity.userId, identity.userName, identityNeedsSync, meeting.id, queryClient]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    void chatClient.sendMessage(newMessage, identity.userName)
      .then(() => setNewMessage(""))
      .catch((error) => console.error("Failed to send message:", error));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-3">
          <Button asChild variant="outline" size="sm">
            <Link to="/">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">{meeting.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {meeting.group} · {meeting.roomLabel} · {meeting.time}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-medium text-primary">
            {meeting.status}
          </div>
          <Button asChild className="bg-orange-500 text-slate-950 hover:bg-orange-400">
            <Link to="/summary" search={{ meetingId: meeting.summaryLinkMeetingId }}>
              Open summary
              <FileText className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-10rem)] gap-4">
        <div className="hidden w-64 shrink-0 space-y-4 xl:block">
          <div className="rounded-[2rem] border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <h3 className="font-heading text-sm font-semibold text-foreground">Participants</h3>
            </div>
            <div className="space-y-3">
              {roster.length === 0 ? (
                <div className="rounded-xl border border-border/60 bg-muted/10 px-3 py-3 text-sm text-muted-foreground">
                  No participants yet. Join the meeting to appear here.
                </div>
              ) : (
                roster.map((participant) => (
                  <div key={`${participant.id}-${participant.role}`} className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/10 px-3 py-3">
                    <div className="relative">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                        {participant.initials}
                      </div>
                      {participant.speaking && (
                        <div className="absolute -bottom-0.5 -right-0.5 live-dot" style={{ width: 6, height: 6 }} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-foreground">{participant.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{participant.role}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Clock3 className="w-4 h-4 text-primary" />
              <h3 className="font-heading text-sm font-semibold text-foreground">Live Task Pulse</h3>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              {meeting.openTasks.length === 0 ? (
                <div className="rounded-xl bg-muted/20 px-3 py-2">No linked tasks yet.</div>
              ) : (
                meeting.openTasks.map((task) => (
                  <div key={task.title} className="rounded-xl bg-muted/20 px-3 py-2">
                    {task.title}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          {videoConfig ? (
            <MeetingStreamSession
              video={videoConfig}
              userId={videoConfig.user_id}
              userName={videoConfig.user_name}
              roster={roster}
              onLeave={() => navigate({ to: "/" })}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-[2rem] border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
              Joining meeting…
            </div>
          )}
        </div>

        <div className="hidden w-80 shrink-0 rounded-[2rem] border border-border bg-card lg:flex lg:flex-col">
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("transcript")}
              className={`flex-1 py-3 text-xs font-medium transition-colors ${
                activeTab === "transcript" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Transcript
              </span>
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-3 text-xs font-medium transition-colors ${
                activeTab === "chat" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Chat
              </span>
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {activeTab === "transcript" ? (
              meeting.transcriptLines.length === 0 ? (
                <p className="mt-8 text-center text-sm text-muted-foreground">
                  Transcript is not available yet for backend meetings.
                </p>
              ) : (
                meeting.transcriptLines.map((line, index) => (
                  <motion.div
                    key={`${line.speaker}-${line.time}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-semibold text-primary">{line.speaker}</span>
                      <span className="text-[10px] text-muted-foreground">{line.time}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">{line.text}</p>
                  </motion.div>
                ))
              )
            ) : (
              <>
                <div className="space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="mt-8 text-center text-sm text-muted-foreground">No chat messages yet</div>
                  ) : (
                    chatMessages.map((message) => (
                      <div key={`${message.id}-${message.timestamp}`} className="mb-3 rounded-lg bg-muted/50 p-3">
                        <div className="mb-1">
                          <span className="text-xs font-semibold text-primary">{message.username}</span>
                          <span className="ml-2 text-[10px] text-muted-foreground">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{message.message}</p>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="border-t border-border p-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      size="icon"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
