/**
 * Pure PCM audio codec utilities: encoding/decoding between
 * base64, Int16, Float32, and AudioBuffer formats.
 */

/** Decodes a base64 string to a Uint8Array. */
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

/** Encodes a Uint8Array to a base64 string. */
export function encode(bytes: Uint8Array): string {
  let binary = ''
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/** Converts a Float32Array PCM buffer to an Int16Array buffer for transmission. */
export const float32ToInt16 = (float32Data: Float32Array): ArrayBuffer => {
  const int16Data = new Int16Array(float32Data.length)
  for (let i = 0; i < float32Data.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Data[i]))
    int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return int16Data.buffer
}

/** Decodes a raw PCM Int16 Uint8Array into a Web Audio API AudioBuffer. */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer)
  const frameCount = dataInt16.length / numChannels
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate)

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel)
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0
    }
  }
  return buffer
}

/** Converts a Float32Array PCM buffer to a base64-encoded PCM blob descriptor. */
export function createBlobFromFloat32(data: Float32Array): {
  data: string
  mimeType: string
} {
  const int16 = new Int16Array(data.length)
  for (let i = 0; i < data.length; i++) {
    int16[i] = data[i] * 32768
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  }
}
