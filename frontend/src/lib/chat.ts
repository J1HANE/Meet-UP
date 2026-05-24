import {
  listMeetingMessagesApi,
  postMeetingMessageApi,
  type BackendChatInfo,
  type BackendChatMessageResponse,
} from "./api/meetings";

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

class ChatClient {
  private meetingId: string | null = null;
  private userId: string | null = null;
  private userName: string | null = null;
  private pollTimer: number | null = null;
  private messages: ChatMessage[] = [];
  private listeners: ((messages: ChatMessage[]) => void)[] = [];

  async connect(meetingId: string, userId: string, userName: string, _chat?: BackendChatInfo) {
    if (
      this.meetingId === meetingId &&
      this.userId === userId &&
      this.userName === userName &&
      this.pollTimer !== null
    ) {
      return;
    }

    await this.disconnect();

    this.meetingId = meetingId;
    this.userId = userId;
    this.userName = userName;
    await this.refreshMessages();
    this.pollTimer = window.setInterval(() => {
      void this.refreshMessages();
    }, 1500);
  }

  private async refreshMessages() {
    if (!this.meetingId) return;
    const response = await listMeetingMessagesApi(
      this.meetingId,
      this.userId ?? undefined,
      this.userName ?? undefined,
    );
    this.messages = this.dedupeMessages(response.map((message) => this.toChatMessage(message)));
    this.notifyListeners();
  }

  private toChatMessage(message: BackendChatMessageResponse): ChatMessage {
    return {
      id: message.id,
      userId: message.userId,
      username: message.displayName,
      message: message.message,
      timestamp: message.sentAt,
    };
  }

  async sendMessage(message: string, username: string) {
    if (!this.meetingId || !this.userId) {
      throw new Error("Chat is not connected");
    }

    await postMeetingMessageApi(this.meetingId, {
      userId: this.userId,
      userName: username,
      message,
    });
    await this.refreshMessages();
  }

  getMessages(): ChatMessage[] {
    return [...this.dedupeMessages(this.messages)];
  }

  private dedupeMessages(messages: ChatMessage[]) {
    const seen = new Set<string>();
    return messages.filter((message) => {
      if (seen.has(message.id)) {
        return false;
      }
      seen.add(message.id);
      return true;
    });
  }

  onMessages(callback: (messages: ChatMessage[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.getMessages()));
  }

  async disconnect() {
    if (this.pollTimer !== null) {
      window.clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.meetingId = null;
    this.userId = null;
    this.userName = null;
    this.messages = [];
    this.notifyListeners();
  }
}

export const chatClient = new ChatClient();
