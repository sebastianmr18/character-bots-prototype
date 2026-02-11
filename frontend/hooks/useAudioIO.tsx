"use client"

import { useRef, useCallback } from 'react';

export function useAudioIO() {
  const audioContext = useRef<AudioContext | null>(null);
  const processor = useRef<AudioWorkletNode | null>(null);
  const source = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextPlayTime = useRef<number>(0);

  const startRecording = useCallback(
    async (onData: (data: ArrayBuffer) => void) => {
      audioContext.current = new AudioContext(); // NO forzar sampleRate
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      await audioContext.current.audioWorklet.addModule('/worklets/audio-processor.js');

      source.current = audioContext.current.createMediaStreamSource(stream);
      processor.current = new AudioWorkletNode(audioContext.current, 'audio-processor');

      processor.current.port.onmessage = (event) => {
        onData(event.data); // PCM16LE @ 16kHz
      };

      source.current.connect(processor.current);
      // No conectar al destination para evitar eco
    },
    []
  );

const playChunk = useCallback((buffer: ArrayBuffer) => {
  if (!audioContext.current) return;

  const ctx = audioContext.current;

  if (nextPlayTime.current < ctx.currentTime) {
    nextPlayTime.current = ctx.currentTime;
  }

  const pcm16 = new Int16Array(buffer);
  const float32 = new Float32Array(pcm16.length);

  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / 0x8000;
  }

  const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
  audioBuffer.getChannelData(0).set(float32);

  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx.destination);

  source.start(nextPlayTime.current);

  nextPlayTime.current += audioBuffer.duration;
}, []);



  const stop = useCallback(() => {
    source.current?.disconnect();
    processor.current?.disconnect();
    audioContext.current?.close();
  }, []);

  return { startRecording, playChunk, stop };
}
