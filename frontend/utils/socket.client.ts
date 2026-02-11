import { io, Socket } from 'socket.io-client';

export class LiveAudioSocket {
  private socket: Socket | null = null;

  connect(url: string): Socket {
    this.socket = io(`${url}/realtime`, {
      transports: ['websocket'],
      forceNew: true
    });
    return this.socket;
  }

  sendAudio(chunk: ArrayBuffer): void {
    this.socket?.emit('audio-in', chunk);
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}