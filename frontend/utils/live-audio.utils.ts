// frontend/utils/audio.utils.ts

// Cola de reproducción global para evitar múltiples audios simultáneos
let audioQueue: Array<() => Promise<void>> = [];
let isPlaying = false;

/**
 * Procesa la cola de audio secuencialmente
 */
const processQueue = async () => {
  if (isPlaying) {
    //console.log(`[AudioUtils] ⏳ Ya hay audio reproduciéndose, cola: ${audioQueue.length}`);
    return;
  }
  
  if (audioQueue.length === 0) {
    //console.log('[AudioUtils] 📪 Cola vacía');
    return;
  }
  
  isPlaying = true;
  const nextAudio = audioQueue.shift();
  
  if (nextAudio) {
    //console.log(`[AudioUtils] ▶️ Reproduciendo siguiente audio. Quedan: ${audioQueue.length}`);
    try {
      await nextAudio();
    } catch (error) {
      console.error('[AudioUtils] Error en reproducción:', error);
    }
  }
  
  isPlaying = false;
  // Procesar siguiente en cola después de un pequeño delay para evitar recursión infinita
  setTimeout(() => processQueue(), 50);
};

/**
 * Reproduce audio PCM en formato base64 proveniente de Gemini
 * @param base64Audio - Audio en base64 (PCM 16-bit little-endian, mono, 24000 Hz)
 * @param audioContext - AudioContext a utilizar
 * @returns Promise que se resuelve cuando el audio se encola correctamente
 */
export const playAudio = async (
  base64Audio: string, 
  audioContext: AudioContext
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Crear función de reproducción para la cola
    const playTask = async (): Promise<void> => {
      return new Promise(async (resolveTask, rejectTask) => {
        try {
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }

          // Decodificar base64 a Uint8Array
          const binary = atob(base64Audio);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }

          // Interpretar como PCM 16-bit little-endian
          const pcm16 = new Int16Array(bytes.buffer);
          const float32Data = new Float32Array(pcm16.length);
          for (let i = 0; i < pcm16.length; i++) {
            float32Data[i] = pcm16[i] / 32768;
          }

          // Crear AudioBuffer
          const audioBuffer = audioContext.createBuffer(
            1,
            float32Data.length,
            24000
          );
          
          audioBuffer.copyToChannel(float32Data, 0);

          // Configurar y reproducir
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContext.destination);
          
          source.onended = () => {
            //console.log(`[AudioUtils] ✅ Reproducción completada: ${float32Data.length} frames`);
            resolveTask();
          };
          
          source.start();
          
          //console.log(`[AudioUtils] ▶️ Reproduciendo ${float32Data.length} frames PCM`);
        } catch (error) {
          console.error('[AudioUtils] Error reproduciendo audio:', error);
          rejectTask(error);
        }
      });
    };

    // Añadir a la cola
    audioQueue.push(playTask);
    //console.log(`[AudioUtils] 📥 Audio encolado. Cola: ${audioQueue.length}`);
    
    // Iniciar procesamiento de cola si no está en curso
    if (!isPlaying) {
      processQueue();
    }
    
    resolve();
  });
};

/**
 * Limpia la cola de audio (útil al desconectar o interrumpir)
 */
export const clearAudioQueue = () => {
  const queueLength = audioQueue.length;
  audioQueue = [];
  isPlaying = false;
  //console.log(`[AudioUtils] 🧹 Cola de audio limpiada (${queueLength} audios descartados)`);
};

/**
 * Convierte Float32Array a Int16Array para envío a Gemini
 */
export const float32ToInt16 = (float32Data: Float32Array): ArrayBuffer => {
  const int16Data = new Int16Array(float32Data.length);
  for (let i = 0; i < float32Data.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Data[i]));
    int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return int16Data.buffer;
};
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function createBlobFromFloat32(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}
