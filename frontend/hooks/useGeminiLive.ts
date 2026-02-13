
import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Transcription, ConnectionStatus } from '@/types/live.types';
import { decode, decodeAudioData, createBlobFromFloat32 } from '@/utils/live-audio.utils';

const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-09-2025';

export const useGeminiLive = (systemInstruction: string) => {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [history, setHistory] = useState<Transcription[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const transcriptBufferRef = useRef<{ user: string; model: string }>({ user: '', model: '' });

  const initAudio = async () => {
    if (!audioContextsRef.current) {
      audioContextsRef.current = {
        input: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 }),
        output: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }),
      };
    }
    if (audioContextsRef.current.input.state === 'suspended') await audioContextsRef.current.input.resume();
    if (audioContextsRef.current.output.state === 'suspended') await audioContextsRef.current.output.resume();
  };

  const stopAllAudio = useCallback(() => {
    sourcesRef.current.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  const handleMessage = useCallback(async (message: LiveServerMessage) => {
    if (message.serverContent?.interrupted) {
      stopAllAudio();
      return;
    }

    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
    if (base64Audio && audioContextsRef.current) {
      const { output } = audioContextsRef.current;
      nextStartTimeRef.current = Math.max(nextStartTimeRef.current, output.currentTime);
      const audioBuffer = await decodeAudioData(decode(base64Audio), output, 24000, 1);
      const source = output.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(output.destination);
      source.addEventListener('ended', () => sourcesRef.current.delete(source));
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;
      sourcesRef.current.add(source);
    }

    if (message.serverContent?.inputTranscription) {
      transcriptBufferRef.current.user += message.serverContent.inputTranscription.text;
    }
    if (message.serverContent?.outputTranscription) {
      transcriptBufferRef.current.model += message.serverContent.outputTranscription.text;
    }

    if (message.serverContent?.turnComplete) {
      const userText = transcriptBufferRef.current.user;
      const modelText = transcriptBufferRef.current.model;
      setHistory(prev => {
        const newHistory = [...prev];
        if (userText) newHistory.push({ role: 'user', text: userText, timestamp: new Date() });
        if (modelText) newHistory.push({ role: 'model', text: modelText, timestamp: new Date() });
        return newHistory.slice(-20);
      });
      transcriptBufferRef.current = { user: '', model: '' };
    }
  }, [stopAllAudio]);

  const connect = async () => {
    try {
      setStatus(ConnectionStatus.CONNECTING);
      await initAudio();
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY || '' });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setStatus(ConnectionStatus.CONNECTED);
            const source = audioContextsRef.current!.input.createMediaStreamSource(stream);
            const scriptProcessor = audioContextsRef.current!.input.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlobFromFloat32(inputData);
              sessionPromise.then((session) => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextsRef.current!.input.destination);
          },
          onmessage: handleMessage,
          onerror: () => setStatus(ConnectionStatus.ERROR),
          onclose: () => setStatus(ConnectionStatus.DISCONNECTED),
        },
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      setStatus(ConnectionStatus.ERROR);
    }
  };

  const disconnect = async () => {
    if (sessionPromiseRef.current) {
      const session = await sessionPromiseRef.current;
      session.close();
      sessionPromiseRef.current = null;
    }
    stopAllAudio();
    setStatus(ConnectionStatus.DISCONNECTED);
  };

  return { status, history, isMuted, setIsMuted, connect, disconnect };
};
