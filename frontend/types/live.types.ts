/**
 * Tipos del modo llamada en vivo (transcripción y estado de conexión).
 */

/** Entrada de transcripción intercambiada en la sesión de voz en vivo. */
export interface Transcription {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

/** Estados posibles de la conexión WebSocket al backend de audio en vivo. */
export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}
