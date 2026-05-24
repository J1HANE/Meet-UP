import { useEffect, useMemo, useRef, useState } from "react";
import {
  StreamCall,
  StreamVideo,
  StreamVideoClient,
  ParticipantView,
  useCall,
  useCallStateHooks,
  type Call,
} from "@stream-io/video-react-sdk";
import { hasScreenShare, type StreamVideoParticipant } from "@stream-io/video-client";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Mic, MicOff, MonitorUp, PhoneOff, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export type MeetingRosterEntry = {
  id: string;
  name: string;
  initials: string;
  role: string;
};

type VideoConfig = {
  api_key: string;
  call_id: string;
  call_type: string;
  token: string;
};

type MeetingStreamSessionProps = {
  video: VideoConfig;
  userId: string;
  userName: string;
  roster: MeetingRosterEntry[];
  onLeave?: () => void;
};

export function MeetingStreamSession({
  video,
  userId,
  userName,
  roster,
  onLeave,
}: MeetingStreamSessionProps) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mediaWarning, setMediaWarning] = useState<string | null>(null);
  const connectionAttemptRef = useRef(0);

  const rosterByUserId = useMemo(
    () => Object.fromEntries(roster.map((entry) => [entry.id, entry])),
    [roster],
  );

  useEffect(() => {
    const attemptId = ++connectionAttemptRef.current;
    let active = true;
    let streamClient: StreamVideoClient | null = null;
    let streamCall: Call | null = null;

    const connect = async () => {
      try {
        setError(null);
        setMediaWarning(null);
        setClient(null);
        setCall(null);

        streamClient = new StreamVideoClient({ apiKey: video.api_key });
        await streamClient.connectUser({ id: userId, name: userName }, video.token);

        streamCall = streamClient.call(video.call_type, video.call_id);
        await streamCall.join({ create: true });

        if (!active || connectionAttemptRef.current !== attemptId) {
          try {
            await streamCall.leave();
          } catch {
            // Ignore double-leave during dev rerenders
          }
          try {
            await streamClient.disconnectUser();
          } catch {
            // Ignore disconnect races during dev rerenders
          }
          return;
        }

        setClient(streamClient);
        setCall(streamCall);

        try {
          await streamCall.camera.enable();
        } catch (cameraError) {
          console.error("Camera enable failed:", cameraError);
          if (active) {
            setMediaWarning("Connected to the call, but camera access is unavailable.");
          }
        }

        try {
          await streamCall.microphone.enable();
        } catch (microphoneError) {
          console.error("Microphone enable failed:", microphoneError);
          if (active) {
            setMediaWarning((current) =>
              current ?? "Connected to the call, but microphone access is unavailable.",
            );
          }
        }
      } catch (err) {
        console.error("Stream connection failed:", err);
        if (active && connectionAttemptRef.current === attemptId) {
          setError(err instanceof Error ? err.message : "Failed to connect to video");
        }
      }
    };

    void connect();

    return () => {
      active = false;
      if (streamCall) {
        void streamCall.leave().catch(() => undefined);
      }
      if (streamClient) {
        void streamClient.disconnectUser().catch(() => undefined);
      }
    };
  }, [video.api_key, video.call_id, video.call_type, video.token, userId, userName]);

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-[2rem] border border-dashed border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
        Video connection failed: {error}
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-[2rem] border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
        Connecting to video…
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {mediaWarning ? (
        <div className="mb-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {mediaWarning}
        </div>
      ) : null}
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <MeetingStreamCallUI rosterByUserId={rosterByUserId} onLeave={onLeave} />
        </StreamCall>
      </StreamVideo>
    </div>
  );
}

function MeetingStreamCallUI({
  rosterByUserId,
  onLeave,
}: {
  rosterByUserId: Record<string, MeetingRosterEntry>;
  onLeave?: () => void;
}) {
  const call = useCall();
  const {
    useParticipants,
    useCameraState,
    useMicrophoneState,
    useScreenShareState,
  } = useCallStateHooks();
  const participants = useParticipants();
  const { camera } = useCameraState();
  const { microphone } = useMicrophoneState();
  const { screenShare } = useScreenShareState();

  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [sharing, setSharing] = useState(false);

  const screenShareParticipants = participants.filter((participant) => {
    return hasScreenShare(participant as StreamVideoParticipant);
  });
  const uniqueParticipants = useMemo(() => {
    const seen = new Set<string>();
    return participants.filter((participant) => {
      const key = participant.sessionId || participant.userId;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [participants]);

  const handleToggleAudio = async () => {
    const next = !muted;
    setMuted(next);
    if (next) {
      await microphone.disable();
    } else {
      await microphone.enable();
    }
  };

  const handleToggleVideo = async () => {
    const next = !videoOn;
    setVideoOn(next);
    if (next) {
      await camera.enable();
    } else {
      await camera.disable();
    }
  };

  const handleToggleScreenShare = async () => {
    const next = !sharing;
    setSharing(next);
    if (next) {
      await screenShare.enable();
    } else {
      await screenShare.disable();
    }
  };

  const handleLeave = async () => {
    await call?.leave();
    onLeave?.();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 grid min-h-0 flex-1 grid-cols-1 gap-3 md:grid-cols-2">
        {uniqueParticipants.length === 0 ? (
          <div className="col-span-full flex items-center justify-center rounded-[2rem] border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
            Waiting for video participants…
          </div>
        ) : (
          uniqueParticipants.map((participant) => {
            const rosterEntry = rosterByUserId[participant.userId];
            const label = rosterEntry?.name || participant.name || participant.userId;

            return (
              <div
                key={participant.sessionId}
                className={`str-video__participant-view relative overflow-hidden rounded-[2rem] border bg-black/80 ${
                  participant.isSpeaking ? "border-primary/50 glow-border" : "border-border"
                }`}
              >
                <ParticipantView
                  participant={participant}
                  className="h-full min-h-[220px] w-full"
                />
                <div className="glass-panel absolute bottom-4 left-4 z-10 rounded-xl px-3 py-1.5 text-xs text-foreground">
                  {label}
                  {rosterEntry?.role ? (
                    <span className="ml-2 text-muted-foreground">· {rosterEntry.role}</span>
                  ) : null}
                  {participant.isSpeaking ? (
                    <span
                      className="live-dot ml-2 inline-block align-middle"
                      style={{ width: 6, height: 6 }}
                    />
                  ) : null}
                </div>
              </div>
            );
          })
        )}

        {screenShareParticipants.map((participant) => {
          const rosterEntry = rosterByUserId[participant.userId];
          const label = rosterEntry?.name || participant.name || participant.userId;

          return (
            <div
              key={`${participant.sessionId}-screen`}
              className="str-video__participant-view relative overflow-hidden rounded-[2rem] border border-primary/50 bg-black/90"
            >
              <ParticipantView
                participant={participant}
                trackType="screenShareTrack"
                className="h-full min-h-[220px] w-full"
              />
              <div className="glass-panel absolute bottom-4 left-4 z-10 rounded-xl px-3 py-1.5 text-xs text-foreground">
                {label}
                <span className="ml-2 text-muted-foreground">· Screen share</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-3 py-3">
        <Button
          variant={muted ? "destructive" : "outline"}
          size="icon"
          onClick={() => void handleToggleAudio()}
          className="h-11 w-11 rounded-full"
        >
          {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </Button>
        <Button
          variant={!videoOn ? "destructive" : "outline"}
          size="icon"
          onClick={() => void handleToggleVideo()}
          className="h-11 w-11 rounded-full"
        >
          {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>
        <Button
          variant={sharing ? "default" : "outline"}
          size="icon"
          onClick={() => void handleToggleScreenShare()}
          className="h-11 w-11 rounded-full"
        >
          <MonitorUp className="w-5 h-5" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => void handleLeave()}
          className="h-11 w-11 rounded-full"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
