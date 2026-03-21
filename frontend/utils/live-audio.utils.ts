// Audio playback queue for sequential, non-overlapping PCM audio reproduction
let audioQueue: Array<() => Promise<void>> = []
let isPlaying = false

const processQueue = async (): Promise<void> => {
  if (isPlaying || audioQueue.length === 0) return

  isPlaying = true
  const nextAudio = audioQueue.shift()

  if (nextAudio) {
    try {
      await nextAudio()
    } catch (error) {
      console.error('[AudioUtils] Error en reproducción:', error)
    }
  }

  isPlaying = false
  setTimeout(processQueue, 50)
}

/**
 * Enqueues and plays PCM16 audio from a base64 string.
 * Audio format: 16-bit little-endian PCM, mono, 24000 Hz.
 */
export const playAudio = (
  base64Audio: string,
  audioContext: AudioContext,
): void => {
  const playTask = async (): Promise<void> => {
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    const binary = atob(base64Audio)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }

    const pcm16 = new Int16Array(bytes.buffer)
    const float32Data = new Float32Array(pcm16.length)
    for (let i = 0; i < pcm16.length; i++) {
      float32Data[i] = pcm16[i] / 32768
    }

    const audioBuffer = audioContext.createBuffer(1, float32Data.length, 24000)
    audioBuffer.copyToChannel(float32Data, 0)

    await new Promise<void>((resolve, reject) => {
      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContext.destination)
      source.onended = () => resolve()
      source.addEventListener('error', (err) => reject(err))
      source.start()
    })
  }

  audioQueue.push(playTask)
  if (!isPlaying) processQueue()
}

/**
 * Clears the playback queue. Call on disconnect or session interruption.
 */
export const clearAudioQueue = (): void => {
  audioQueue = []
  isPlaying = false
}

/**
 * Converts a base64-encoded audio string to an object URL for use in
 * HTML audio elements or the Web Audio API.
 */
export function base64ToObjectUrl(
  base64String: string,
  mediaType = 'audio/mpeg',
): string {
  const cleanedBase64 = base64String.replace(/\s/g, '')
  const binaryString = atob(cleanedBase64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  const audioBlob = new Blob([bytes], { type: mediaType })
  return URL.createObjectURL(audioBlob)
}

