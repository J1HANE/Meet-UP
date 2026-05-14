import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Clock3, FileText, MessageSquare, Mic, MicOff, MonitorUp, PhoneOff, Users, Video, VideoOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMeetingById } from "@/lib/meetings";
import { useState, useEffect, useRef } from "react";
import { chatClient, ChatMessage } from "@/lib/chat";

export const Route = createFileRoute("/meeting")({
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
  const meeting = getMeetingById(id);

  if (!meeting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Meeting not found</h1>
          <p className="text-muted-foreground mt-2">The meeting you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link to="/meeting/list">
              Back to meetings
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return <MeetingRoom meetingId={meeting.id} />;
}

function MeetingRoom({ meetingId }: { meetingId: string }) {
  const meeting = getMeetingById(meetingId);
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "transcript">("transcript");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("You");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Meeting room useEffect triggered for meetingId:', meetingId);
    
    const connectToChat = async () => {
      try {
        console.log('Connecting to chat...');
        await chatClient.connect(meetingId, username);
        
        // Listen for chat messages
        const unsubscribe = chatClient.onMessages((messages) => {
          console.log('=== CHAT UPDATE ===');
          console.log('Received chat messages:', messages);
          console.log('Setting chatMessages state...');
          setChatMessages(messages);
          console.log('ChatMessages state updated');
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        });
        
        return unsubscribe;
      } catch (error) {
        console.error('Failed to connect to chat:', error);
      }
    };

    connectToChat();

    return () => {
      console.log('Cleaning up chat connection');
      chatClient.disconnect();
    };
  }, [meetingId, username]);

  const handleSendMessage = () => {
    console.log('handleSendMessage called, newMessage:', newMessage);
    if (newMessage.trim()) {
      chatClient.sendMessage(newMessage, username);
      setNewMessage("");
      
      // Force React re-render
      setTimeout(() => {
        const currentMessages = chatClient.getMessages();
        console.log('Forcing update with messages:', currentMessages);
        setChatMessages([...currentMessages]);
      }, 100);
    }
  };

  if (!meeting) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Meeting not found</h1>
          <p className="text-muted-foreground mt-2">The meeting you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link to="/meeting/list">
              Back to meetings
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-3">
          <Button asChild variant="outline" size="sm">
            <Link to="/meeting/list">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to meetings
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
            <Link to="/summary" search={{ meetingId: meeting.id }}>
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
              {meeting.participants.map((participant) => (
                <div key={participant.name} className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/10 px-3 py-3">
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
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Clock3 className="w-4 h-4 text-primary" />
              <h3 className="font-heading text-sm font-semibold text-foreground">Live Task Pulse</h3>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              {meeting.openTasks.map((task) => (
                <div key={task.title} className="rounded-xl bg-muted/20 px-3 py-2">
                  {task.title}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-4 grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
            {meeting.participants.map((participant) => (
              <div
                key={participant.name}
                className={`relative flex items-center justify-center rounded-[2rem] border bg-muted/30 ${
                  participant.speaking ? "border-primary/50 glow-border" : "border-border"
                }`}
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full gradient-surface text-2xl font-heading font-bold text-foreground">
                  {participant.initials}
                </div>
                <div className="glass-panel absolute bottom-4 left-4 rounded-xl px-3 py-1.5 text-xs text-foreground">
                  {participant.name}
                  {participant.speaking && (
                    <span
                      className="live-dot ml-2 inline-block align-middle"
                      style={{ width: 6, height: 6, display: "inline-block", verticalAlign: "middle" }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 py-3">
            <Button
              variant={muted ? "destructive" : "outline"}
              size="icon"
              onClick={() => setMuted(!muted)}
              className="h-11 w-11 rounded-full"
            >
              {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            <Button
              variant={!videoOn ? "destructive" : "outline"}
              size="icon"
              onClick={() => setVideoOn(!videoOn)}
              className="h-11 w-11 rounded-full"
            >
              {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </Button>
            <Button variant="outline" size="icon" className="h-11 w-11 rounded-full">
              <MonitorUp className="w-5 h-5" />
            </Button>
            <Button variant="destructive" size="icon" className="h-11 w-11 rounded-full">
              <PhoneOff className="w-5 h-5" />
            </Button>
          </div>
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
            ) : (
              <>
                <div className="space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="mt-8 text-center text-sm text-muted-foreground">No chat messages yet</div>
                  ) : (
                    chatMessages.map((message) => (
                      <div key={message.id} className="mb-3 p-3 rounded-lg bg-muted/50">
                        <div className="mb-1">
                          <span className="text-xs font-semibold text-primary">{message.username}</span>
                          <span className="text-[10px] text-muted-foreground ml-2">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{message.message}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-border p-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      size="icon"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>
    </motion.div>
  );
}
