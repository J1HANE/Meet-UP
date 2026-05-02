import { ChatConfig } from './chat';

export interface StreamChatMessage {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
}

export class StreamChatClient {
  private channel: any = null;
  private client: any = null;
  private messages: StreamChatMessage[] = [];
  private listeners: ((messages: StreamChatMessage[]) => void)[] = [];

  constructor(private config: ChatConfig) {
    // Initialize Stream Chat client
  this.initializeClient();
  }

  private initializeClient() {
    // In real implementation, you would initialize Stream Chat client
    // For now, we'll simulate with enhanced functionality
    console.log('Initializing Stream Chat client with config:', this.config);
    
    // Simulate WebSocket connection
    this.connectToStream();
  }

  private async connectToStream() {
    try {
      console.log('Connecting to Stream Chat WebSocket...');
      
      // Simulate successful connection
      setTimeout(() => {
        this.simulateRealtimeMessages();
      }, 1000);
      
    } catch (error) {
      console.error('Stream Chat connection error:', error);
    }
  }

  private simulateRealtimeMessages() {
    // Simulate receiving real-time messages from Stream
    const initialMessages: StreamChatMessage[] = [
      {
        id: '1',
        user_id: 'system',
        text: '🎉 Bienvenue dans la réunion!',
        created_at: new Date().toISOString(),
      },
      {
        id: '2', 
        user_id: 'bot',
        text: '📋 Le meeting est maintenant enregistré et partagé.',
        created_at: new Date().toISOString(),
      }
    ];

    this.messages = initialMessages;
    this.notifyListeners();
    
    // Simulate periodic messages
    this.startPeriodicMessages();
  }

  private startPeriodicMessages() {
    // Simulate other users joining/leaving
    setInterval(() => {
      const randomMessages = [
        { user_id: 'user1', text: 'Je suis prêt pour la présentation!', created_at: new Date().toISOString() },
        { user_id: 'user2', text: 'Excellent travail sur l\'API!', created_at: new Date().toISOString() },
        { user_id: 'user3', text: 'Le chat fonctionne parfaitement! 🎉', created_at: new Date().toISOString() },
      ];
      
      if (Math.random() > 0.7) {
        const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)];
        const newMessage: StreamChatMessage = {
          id: Date.now().toString(),
          user_id: randomMessage.user_id,
          text: randomMessage.text,
          created_at: new Date().toISOString(),
        };
        
        this.messages.push(newMessage);
        this.notifyListeners();
        console.log('New Stream message:', newMessage);
      }
    }, 8000); // Every 8 seconds
  }

  sendMessage(text: string, userId: string) {
    const message: StreamChatMessage = {
      id: Date.now().toString(),
      user_id: userId,
      text: text,
      created_at: new Date().toISOString(),
    };

    this.messages.push(message);
    this.notifyListeners();
    
    console.log('Sending to Stream:', message);
    
    // In real implementation, send to Stream Chat API
    // this.channel.sendMessage(message);
  }

  getMessages(): StreamChatMessage[] {
    return [...this.messages];
  }

  onMessages(callback: (messages: StreamChatMessage[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback(this.getMessages()));
  }

  disconnect() {
    if (this.channel) {
      console.log('Disconnecting from Stream Chat');
      this.channel = null;
    }
    this.messages = [];
    this.listeners = [];
  }
}
