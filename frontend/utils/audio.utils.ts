export const playAudio = (base64String: string): void => {
  const cleanedBase64 = base64String.replace(/\s/g, "")
  let binaryString: string

  try {
    binaryString = atob(cleanedBase64)
  } catch (e) {
    console.error("Error al decodificar Base64 (atob falló):", e)
    console.log("Cadena intentada (limpia):", cleanedBase64.substring(0, 50) + "...")
    return
  }

  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  const audioBlob = new Blob([bytes], { type: "audio/mp3" })
  const audioUrl = URL.createObjectURL(audioBlob)
  const audio = new Audio(audioUrl)
  audio.preload = "auto"
  audio.crossOrigin = "anonymous"

  audio.addEventListener(
    "canplaythrough",
    () => {
      audio.currentTime = 0
      audio.play().catch((e) => {
        console.error("Error al reproducir audio:", e)
      })
    },
    { once: true },
  )

  setTimeout(() => {
    URL.revokeObjectURL(audioUrl)
  }, 30000)
}
