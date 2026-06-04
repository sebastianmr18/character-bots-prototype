/**
 * Convierte audio codificado en base64 a una URL de objeto para elementos `<audio>` o Web Audio API.
 *
 * @param base64String - Datos de audio en base64 (se eliminan espacios en blanco).
 * @param mediaType - MIME del blob; por defecto `audio/mpeg`.
 * @returns URL de objeto que debe revocarse con `URL.revokeObjectURL` cuando ya no se use.
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
