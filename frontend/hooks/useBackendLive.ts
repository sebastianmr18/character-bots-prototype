// frontend/hooks/useBackendLive.ts

import { useState, useRef, useCallback, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import { Transcription, ConnectionStatus } from '@/types/live.types';
import { playAudio, float32ToInt16, clearAudioQueue } from '@/utils/live-audio.utils';

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000';

export const useBackendLive = (systemInstruction: string) => {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [history, setHistory] = useState<Transcription[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const isSessionActiveRef = useRef(false);
  const isInterruptedRef = useRef(false);

  const initAudio = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000
      });
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  };

  const cleanupAudio = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const connect = useCallback(async () => {
    try {
      setStatus(ConnectionStatus.CONNECTING);
      await initAudio();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const socket = io(SOCKET_URL, { 
        transports: ['websocket'], 
        reconnection: true 
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('[Socket] Conectado, enviando start');
        socket.emit('start', { systemInstruction });
      });

      socket.on('session-ready', ({ sessionId }) => {
        console.log('[Socket] Sesión lista:', sessionId);
        setStatus(ConnectionStatus.CONNECTED);
        isSessionActiveRef.current = true;
        isInterruptedRef.current = false;
        startAudioCapture();
      });

      socket.on('transcription', (data) => {
        setHistory(prev => [...prev.slice(-19), { 
          role: data.role, 
          text: data.text, 
          timestamp: new Date() 
        }]);
      });

      socket.on('audio', (data) => {
        if (data.audio && audioContextRef.current && !isInterruptedRef.current) {
          // Reproducir usando la cola
          playAudio(data.audio, audioContextRef.current).catch(err => 
            console.error('Error en playAudio:', err)
          );
        }
      });

      socket.on('interrupted', () => {
        console.log('🚨 Interrupción recibida - limpiando cola de audio');
        isInterruptedRef.current = true;
        clearAudioQueue();
        
        // Pequeño retraso para permitir que el backend procese
        setTimeout(() => {
          isInterruptedRef.current = false;
        }, 500);
      });

      socket.on('error', (data) => {
        console.error('Error del backend:', data.message);
        setStatus(ConnectionStatus.ERROR);
        isSessionActiveRef.current = false;
        clearAudioQueue();
      });

      socket.on('disconnect', () => {
        console.log('[Socket] Desconectado');
        setStatus(ConnectionStatus.DISCONNECTED);
        isSessionActiveRef.current = false;
        clearAudioQueue();
        cleanupAudio();
      });

    } catch (error) {
      console.error('Error al conectar:', error);
      setStatus(ConnectionStatus.ERROR);
    }
  }, [systemInstruction]);

  const disconnect = useCallback(() => {
    isSessionActiveRef.current = false;
    isInterruptedRef.current = false;
    socketRef.current?.disconnect();
    clearAudioQueue();
    cleanupAudio();
    setStatus(ConnectionStatus.DISCONNECTED);
  }, []);

  const startAudioCapture = () => {
    if (!audioContextRef.current || !mediaStreamRef.current || !socketRef.current) {
      console.warn('Audio capture prerequisites not ready');
      return;
    }

    const context = audioContextRef.current;
    const source = context.createMediaStreamSource(mediaStreamRef.current);
    sourceRef.current = source;

    const processor = context.createScriptProcessor(4096, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (!isSessionActiveRef.current || isMuted || isInterruptedRef.current) return;
      if (!socketRef.current?.connected) return;

      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBuffer = float32ToInt16(inputData);
      
      socketRef.current.emit('audio', pcmBuffer);
    };

    source.connect(processor);
    processor.connect(context.destination);
    
    console.log('[AudioCapture] Iniciado');
  };

  useEffect(() => {
    return () => {
      isSessionActiveRef.current = false;
      isInterruptedRef.current = false;
      socketRef.current?.disconnect();
      clearAudioQueue();
      cleanupAudio();
    };
  }, []);

  return {
    status,
    history,
    isMuted,
    setIsMuted,
    connect,
    disconnect
  };
};