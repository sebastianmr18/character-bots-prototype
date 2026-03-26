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
