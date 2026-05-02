export interface VideoConfig {
  call_id: string;
  call_type: string;
  token: string;
}

export class StreamVideoClient {
  private call: any = null;
  private participants: any[] = [];
  private listeners: ((state: any) => void)[] = [];

  constructor(private config: VideoConfig) {
    console.log('Initializing Stream Video client with config:', this.config);
    this.initializeCall();
  }

  private initializeCall() {
    // In real implementation, you would initialize Stream Video SDK
    console.log('Setting up video call with ID:', this.config.call_id);
    
    this.simulateVideoCall();
  }

  private simulateVideoCall() {
    // Simulate video call state
    setTimeout(() => {
      this.simulateParticipantsJoining();
    }, 1500);
  }

  private simulateParticipantsJoining() {
    console.log('Simulating participants joining...');
    const mockParticipants = [
      { id: 'user1', name: 'Alice', avatar: '👩', speaking: false },
      { id: 'user2', name: 'Bob', avatar: '👨‍💼', speaking: false },
      { id: 'user3', name: 'Charlie', avatar: '👨‍💻', speaking: true },
    ];

    this.participants = mockParticipants;
    this.notifyListeners();
    
    // Simulate random speaking changes
    this.startSpeakingSimulation();
  }

  private startSpeakingSimulation() {
    setInterval(() => {
      const randomIndex = Math.floor(Math.random() * this.participants.length);
      this.participants.forEach((participant, index) => {
        participant.speaking = index === randomIndex;
      });
      this.notifyListeners();
    }, 3000); // Every 3 seconds
  }

  joinCall(userId: string) {
    console.log(`${userId} is joining the video call`);
    
    const participant = {
      id: userId,
      name: `User ${userId}`,
      avatar: '👤',
      speaking: false
    };
    
    this.participants.push(participant);
    this.notifyListeners();
  }

  leaveCall(userId: string) {
    console.log(`${userId} is leaving the video call`);
    this.participants = this.participants.filter(p => p.id !== userId);
    this.notifyListeners();
  }

  toggleAudio(userId: string, muted: boolean) {
    const participant = this.participants.find(p => p.id === userId);
    if (participant) {
      participant.muted = muted;
      console.log(`${userId} is now ${muted ? 'muted' : 'unmuted'}`);
      this.notifyListeners();
    }
  }

  toggleVideo(userId: string, videoOn: boolean) {
    const participant = this.participants.find(p => p.id === userId);
    if (participant) {
      participant.videoOn = videoOn;
      console.log(`${userId} video is now ${videoOn ? 'on' : 'off'}`);
      this.notifyListeners();
    }
  }

  getParticipants() {
    return [...this.participants];
  }

  onStateChange(callback: (state: any) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(callback => callback({
      participants: this.getParticipants(),
      call: this.call
    }));
  }

  endCall() {
    console.log('Ending video call');
    this.call = null;
    this.participants = [];
    this.notifyListeners();
  }
}
