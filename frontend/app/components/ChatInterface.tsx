"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"

// URL del WebSocket
const WS_URL = "ws://localhost:8000/ws/chat/"

interface Message {
  id: number
  sender: "user" | "bot"
  text: string
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [status, setStatus] = useState("Desconectado")
  const ws = useRef<WebSocket | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 1. CONEXIÓN AL WEBSOCKET
  useEffect(() => {
    ws.current = new WebSocket(WS_URL)

    ws.current.onopen = () => {
      setStatus("Conectado")
    }

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case "status":
          setStatus(data.message)
          break

        case "transcription":
          // Añade la transcripción del usuario
          setMessages((prev) => [...prev, { id: Date.now(), sender: "user", text: data.text }])
          console.log("Transcripción recibida")
          break

        case "text_response":
          // Añade la respuesta de texto del bot
          setMessages((prev) => [...prev, { id: Date.now(), sender: "bot", text: data.text }])
          setStatus("Listo")
          console.log("Repuesta de Gemini Escrita")
          break

        case "audio_response":
          // Recibe el audio codificado en Base64
          if (data.audio) {
            // Reproducir audio inmediatamente sin esperar
            console.log("audio listo")
            playAudio(data.audio)
          }
          break

        case "error":
          setStatus(`Error: ${data.message}`)
          break
      }
    }

    ws.current.onclose = () => {
      setStatus("Desconectado")
      console.log("WebSocket cerrado. Reconectando en 5s...")
    }

    ws.current.onerror = (error) => {
      console.error("Error de WebSocket:", error)
      setStatus("Error de conexión")
    }

    // Limpieza al desmontar el componente
    return () => {
      ws.current?.close()
    }
  }, [])

  // Función para reproducir el audio de Base64
  const playAudio = (base64String: string) => {
    const cleanedBase64 = base64String.replace(/\s/g, "")

    let binaryString
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

    // 2. Crear un Blob (archivo binario) y una URL de objeto
    const audioBlob = new Blob([bytes], { type: "audio/mp3" }) // Asumimos MP3 de ElevenLabs
    const audioUrl = URL.createObjectURL(audioBlob)

    // 3. Reproducir con configuración para evitar cortes
    const audio = new Audio(audioUrl)

    // Configurar el audio para evitar cortes al inicio
    audio.preload = "auto"
    audio.crossOrigin = "anonymous"

    // Esperar a que el audio esté listo antes de reproducir
    audio.addEventListener(
      "canplaythrough",
      () => {
        audio.currentTime = 0 // Asegurar que empiece desde el inicio
        audio.play().catch((e) => {
          console.error("Error al reproducir audio:", e)
        })
      },
      { once: true },
    )

    // Limpiar la URL del objeto después de un tiempo
    setTimeout(() => {
      URL.revokeObjectURL(audioUrl)
    }, 30000) // 30 segundos
  }

  // 2. ENVÍO DE MENSAJES DE TEXTO
  const sendMessage = (text: string) => {
    if (!text.trim() || ws.current?.readyState !== WebSocket.OPEN) return

    // 1. Añade el mensaje del usuario
    setMessages((prev) => [...prev, { id: Date.now(), sender: "user", text: text }])
    setInput("")

    // 2. Envía a Django
    ws.current.send(JSON.stringify({ text }))
  }

  // 3. MANEJO DE GRABACIÓN DE VOZ (Speech-to-Text en el Frontend)
  const startRecording = async () => {
    if (!navigator.mediaDevices) {
      alert("Tu navegador no soporta grabación de audio.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      audioChunks.current = []

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data)
      }

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" })

        // Convertir audio a Base64 para enviar al backend
        const reader = new FileReader()
        reader.onload = () => {
          const audioBase64 = reader.result as string
          // Remover el prefijo "data:audio/webm;base64," para obtener solo el Base64
          const base64Data = audioBase64.split(",")[1]

          // Enviar audio al backend para transcripción
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(
              JSON.stringify({
                type: "audio",
                audio: base64Data,
              }),
            )
          }
        }
        reader.readAsDataURL(audioBlob)

        // Detener las pistas de audio
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.current.start()
      setIsRecording(true)
      setStatus("Grabando voz...")
    } catch (err) {
      console.error("Error al acceder al micrófono:", err)
      alert("Necesitas dar permiso al micrófono.")
    }
  }

  const stopRecording = () => {
    mediaRecorder.current?.stop()
    setIsRecording(false)
    setStatus("Procesando audio...")
  }

  const getStatusDisplay = () => {
    switch (status) {
      case "Conectado":
      case "Listo":
        return { color: "text-green-600 dark:text-green-400", icon: "●", bg: "bg-green-100 dark:bg-green-900/30" }
      case "Desconectado":
      case "Error de conexión":
        return { color: "text-red-600 dark:text-red-400", icon: "●", bg: "bg-red-100 dark:bg-red-900/30" }
      case "Grabando voz...":
        return { color: "text-orange-600 dark:text-orange-400", icon: "●", bg: "bg-orange-100 dark:bg-orange-900/30" }
      default:
        return { color: "text-blue-600 dark:text-blue-400", icon: "●", bg: "bg-blue-100 dark:bg-blue-900/30" }
    }
  }

  const statusDisplay = getStatusDisplay()
  const isConnected = ws.current?.readyState === WebSocket.OPEN

  // 4. Renderizado
  return (
    <div
      className="mx-auto max-w-2xl h-[700px] flex flex-col rounded-2xl border border-gray-200 shadow-2xl 
                    bg-white dark:bg-gray-900 dark:border-gray-700 
                    text-gray-900 dark:text-gray-100 transition-all duration-300 overflow-hidden"
    >
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Asistente de Programación</h1>
            <p className="text-sm text-blue-100">Prototipo con RAG y ElevenLabs</p>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusDisplay.bg} backdrop-blur-sm`}>
            <span className={`${statusDisplay.color} text-xs animate-pulse`}>{statusDisplay.icon}</span>
            <span className={`text-sm font-medium ${statusDisplay.color}`}>{status}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-800/50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">¡Comienza la conversación!</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Escribe tu pregunta de programación o usa el micrófono para hablar con el asistente.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`flex items-end gap-2 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                  ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {msg.sender === "user" ? "TÚ" : "AI"}
                </div>

                <div
                  className={`py-3 px-4 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg
                  ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm border border-gray-200 dark:border-gray-600"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage(input)
          }}
          className="flex gap-2 mb-3"
        >
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta de programación..."
              disabled={isRecording || !isConnected}
              className="w-full p-3 pr-12 rounded-xl border-2 border-gray-200 
                       focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                       dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 
                       dark:focus:border-blue-400 dark:focus:ring-blue-900/30
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200 outline-none"
            />
            {input.length > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{input.length}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isRecording || !isConnected}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold 
                     hover:bg-blue-700 active:scale-95
                     disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600
                     transition-all duration-200 shadow-md hover:shadow-lg
                     flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!isConnected}
          className={`w-full p-4 rounded-xl font-semibold text-white transition-all duration-300 
            flex items-center justify-center gap-3 shadow-md hover:shadow-lg active:scale-[0.98]
            ${
              isRecording
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            } 
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-green-500 disabled:hover:to-green-600`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isRecording ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            )}
          </svg>
          <span>{isRecording ? "Detener Grabación" : "Iniciar Grabación de Voz"}</span>
          {isRecording && (
            <span className="flex gap-1">
              <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </span>
          )}
        </button>

        <p className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
          Transcripción de voz con ElevenLabs • Respuestas con audio incluido
        </p>
      </div>
    </div>
  )
}

export default ChatInterface
