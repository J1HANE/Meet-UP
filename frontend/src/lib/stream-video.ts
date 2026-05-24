export interface VideoConfig {
  api_key: string;
  call_id: string;
  call_type: string;
  token: string;
  user_id: string;
  user_name: string;
}

export class StreamVideoClient {
  private call: any = null;
  private client: any = null;
  private participants: any[] = [];
  private listeners: ((state: any) => void)[] = [];
  private connected = false;

  constructor(private config: VideoConfig) {
    void this.initializeCall();
  }

  private async initializeCall() {
    try {
      const { StreamVideoClient: VideoClient } = await import('@stream-io/video-react-sdk');

      this.client = new VideoClient({ apiKey: this.config.api_key });
      await this.client.connectUser(
        { id: this.config.user_id, name: this.config.user_name },
        this.config.token,
      );
      this.connected = true;

      this.call = this.client.call(this.config.call_type, this.config.call_id);
      await this.call.join({ create: true });

      this.call.on('call.participant_joined', () => {
        this.updateParticipants();
      });

      this.call.on('call.participant_left', () => {
        this.updateParticipants();
      });

      this.call.on('call.speaking_changed', () => {
        this.updateParticipants();
      });

      this.updateParticipants();
    } catch (error) {
      console.error('Failed to initialize Stream Video:', error);
      this.participants = [];
      this.notifyListeners();
    }
  }

  private updateParticipants() {
    if (!this.call) return;

    try {
      const state = this.call.state;
      this.participants = Object.values(state.participants || {}).map((p: any) => ({
        id: p.userId,
        name: p.name || p.userId,
        initials: (p.name || p.userId)
          .split(' ')
          .map((part: string) => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        speaking: p.speaking,
        muted: p.muted,
        videoOn: p.publishedTracks?.video || false,
      }));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to update participants:', error);
    }
  }

  async joinCall(_userId: string) {
    if (this.call && this.connected) {
      this.updateParticipants();
    }
  }

  async leaveCall(_userId: string) {
    if (this.call) {
      try {
        await this.call.leave();
        this.updateParticipants();
      } catch (error) {
        console.error('Failed to leave call:', error);
      }
    }
  }

  async toggleAudio(_userId: string, muted: boolean) {
    if (this.call) {
      try {
        if (muted) {
          await this.call.microphone.disable();
        } else {
          await this.call.microphone.enable();
        }
      } catch (error) {
        console.error('Failed to toggle audio:', error);
      }
    }
  }

  async toggleVideo(_userId: string, videoOn: boolean) {
    if (this.call) {
      try {
        if (videoOn) {
          await this.call.camera.enable();
        } else {
          await this.call.camera.disable();
        }
      } catch (error) {
        console.error('Failed to toggle video:', error);
      }
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

  async endCall() {
    if (this.call) {
      try {
        await this.call.leave();
      } catch (error) {
        console.error('Failed to end call:', error);
      }
      this.call = null;
    }
    if (this.client && this.connected) {
      try {
        await this.client.disconnectUser();
      } catch (error) {
        console.error('Failed to disconnect Stream Video user:', error);
      }
      this.client = null;
      this.connected = false;
    }
    this.participants = [];
    this.notifyListeners();
  }
}
