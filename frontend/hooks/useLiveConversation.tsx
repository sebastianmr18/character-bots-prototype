"use client"

import { useState, useCallback, useRef } from 'react';
import { LiveAudioSocket } from '@/utils/socket.client';
import { useAudioIO } from '@/hooks/useAudioIO';

export function useLiveConversation(backendUrl: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState('');
  const socketRef = useRef(new LiveAudioSocket());
  const { startRecording, playChunk, stop } = useAudioIO();

  const connect = useCallback(async () => {
    const socket = socketRef.current.connect(backendUrl);

    socket.on('connect', () => {
      console.log("Socket.io conectado. Esperando a Gemini...");
    });

    socket.on('open', async () => {
      console.log("Gemini listo. Iniciando micrófono...");
      setIsConnected(true);

      let pending = new Uint8Array(0);

      await startRecording((pcm16Buffer) => {
        console.log("Estoy grabado tu audio...");
        const chunk = new Uint8Array(pcm16Buffer);

        const merged = new Uint8Array(pending.length + chunk.length);
        merged.set(pending, 0);
        merged.set(chunk, pending.length);

        pending = merged;

        // Enviar solo cuando haya >= 40 ms (~1280 bytes)
        if (pending.length >= 1280) {
          socketRef.current.sendAudio(pending.buffer);
          pending = new Uint8Array(0);
        }
      });
    });

    socket.on('audio-out', (buffer: ArrayBuffer) => playChunk(buffer));

    socket.on('text-out', (text: string) =>
      setTranscript(prev => prev + ' ' + text)
    );

    socket.on('close', () => {
      console.log("Gemini cerró la sesión.");
      stop();
      setIsConnected(false);
    });
  }, [backendUrl, startRecording, playChunk, stop]);

  const disconnect = useCallback(() => {
    socketRef.current.disconnect();
    stop();
    setIsConnected(false);
  }, [stop]);

  return { isConnected, transcript, connect, disconnect };
}
