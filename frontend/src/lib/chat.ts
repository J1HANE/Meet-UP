export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

export interface ChatConfig {
  apiKey: string;
  channelId: string;
  channelType: string;
  userToken: string;
}

class ChatClient {
  private config: ChatConfig | null = null;
  private ws: WebSocket | null = null;
  private messages: ChatMessage[] = [];
  private listeners: ((messages: ChatMessage[]) => void)[] = [];

  async connect(meetingId: string, userId: string) {
    try {
      // For now, skip backend connection and use mock data
      console.log('Connecting to chat for meeting:', meetingId, 'user:', userId);
      
      // Simulate WebSocket connection immediately
      this.simulateMessages();
      
      return {
        meetingId,
        chat: {
          apiKey: 'mock-api-key',
          channelId: meetingId,
          channelType: 'messaging',
          userToken: 'mock-token'
        }
      };
    } catch (error) {
      console.error('Chat connection error:', error);
      throw error;
    }
  }

  private connectWebSocket() {
    if (!this.config) return;

    // For now, simulate WebSocket connection with mock messages
    // In real implementation, you'd connect to Stream Chat WebSocket
    this.simulateMessages();
  }

  private simulateMessages() {
    console.log('Simulating chat messages...');
    
    // Simulate some initial chat messages
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        userId: 'system',
        username: 'System',
        message: 'Welcome to the meeting chat!',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        userId: 'user1',
        username: 'John Doe',
        message: 'Hello everyone! Ready to start the meeting.',
        timestamp: new Date().toISOString(),
      },
      {
        id: '3',
        userId: 'user2',
        username: 'Sarah Kim',
        message: 'Great! Let me share my screen for the demo.',
        timestamp: new Date().toISOString(),
      },
    ];

    this.messages = mockMessages;
    console.log('Setting initial messages:', this.messages);
    this.notifyListeners();
  }

  sendMessage(message: string, username: string) {
    console.log('Sending message:', message, 'from:', username);
    
    if (!this.config) {
      console.log('No config, but sending anyway for testing');
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'current-user',
      username,
      message,
      timestamp: new Date().toISOString(),
    };

    this.messages.push(newMessage);
    console.log('Updated messages:', this.messages);
    this.notifyListeners();

    // In real implementation, send to WebSocket
    console.log('Message sent successfully');
  }

  getMessages(): ChatMessage[] {
    return [...this.messages];
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

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.config = null;
    this.messages = [];
  }
}

export const chatClient = new ChatClient();
