'use client';

import React, { useState, useRef, useEffect } from 'react';

// URL del WebSocket
const WS_URL = 'ws://localhost:8000/ws/chat/'; 

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: string;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('Desconectado');
  const ws = useRef<WebSocket | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // 1. CONEXIÓN AL WEBSOCKET
  useEffect(() => {
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      setStatus('Conectado');
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'status':
          setStatus(data.message);
          break;

        case 'text_response':
          // Añade la respuesta de texto del bot
          setMessages((prev) => [
            ...prev,
            { id: Date.now(), sender: 'bot', text: data.text },
          ]);
          setStatus('Listo');
          break;

        case 'audio_response':
          // Recibe el audio codificado en Base64
          if (data.audio) {
            playAudio(data.audio);
          }
          break;
      }
    };

    ws.current.onclose = () => {
      setStatus('Desconectado');
      console.log('WebSocket cerrado. Reconectando en 5s...');
    };

    ws.current.onerror = (error) => {
      console.error('Error de WebSocket:', error);
      setStatus('Error de conexión');
    };

    // Limpieza al desmontar el componente
    return () => {
      ws.current?.close();
    };
  }, []);

  // Función para reproducir el audio de Base64
  const playAudio = (base64String: string) => {
    const cleanedBase64 = base64String.replace(/\s/g, ''); 

    let binaryString;
    try {
        binaryString = atob(cleanedBase64);
    } catch (e) {
        console.error("Error al decodificar Base64 (atob falló):", e);
        console.log("Cadena intentada (limpia):", cleanedBase64.substring(0, 50) + '...');
        return; 
    }
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // 2. Crear un Blob (archivo binario) y una URL de objeto
    const audioBlob = new Blob([bytes], { type: 'audio/mp3' }); // Asumimos MP3 de ElevenLabs
    const audioUrl = URL.createObjectURL(audioBlob);

    // 3. Reproducir
    const audio = new Audio(audioUrl);
    audio.play();
  };


  // 2. ENVÍO DE MENSAJES DE TEXTO
  const sendMessage = (text: string) => {
    if (!text.trim() || ws.current?.readyState !== WebSocket.OPEN) return;

    // 1. Añade el mensaje del usuario
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'user', text: text },
    ]);
    setInput('');
    
    // 2. Envía a Django
    ws.current.send(JSON.stringify({ text }));
  };


  // 3. MANEJO DE GRABACIÓN DE VOZ (Speech-to-Text en el Frontend)
  const startRecording = async () => {
    if (!navigator.mediaDevices) {
        alert("Tu navegador no soporta grabación de audio.");
        return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        
        // TODO: Implementa STT aquí. Por ahora, usaremos un PLACEHOLDER.
        const transcription = "Esto es una transcripción de prueba. ¿Qué es RAG?"; 
        
        // 4. Envía la transcripción a Django
        sendMessage(transcription); 

        // Detener las pistas de audio
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setStatus('Grabando voz...');
    } catch (err) {
      console.error('Error al acceder al micrófono:', err);
      alert('Necesitas dar permiso al micrófono.');
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
    setStatus('Procesando audio...');
  };

  // 4. Renderizado
return (
    // Contenedor Principal: 
    // - Centrado, ancho máximo, relleno.
    // - Fondo blanco en modo claro, fondo oscuro en modo oscuro.
    // - Borde sutil.
    <div className="mx-auto max-w-lg p-5 rounded-xl border border-gray-300 shadow-xl 
                    bg-white dark:bg-gray-800 dark:border-gray-700 
                    text-gray-900 dark:text-gray-100 transition-colors duration-300">
      
      {/* Título y Estado */}
      <h1 className="text-2xl font-bold mb-2">Prototipo de Personaje con RAG</h1>
      <p className="mb-4 text-sm">
        Estado del WebSocket: <strong className={status === 'Conectado' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
          {status}
        </strong>
      </p>
      
      {/* --- */}
      
      {/* Área de Mensajes */}
      {/* - Altura fija, scroll vertical. */}
      {/* - Fondo ligeramente diferente para contraste. */}
      {/* - Borde y relleno. */}
      <div className="h-[400px] overflow-y-auto p-3 mb-4 rounded-lg 
                      bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
        {messages.map((msg) => (
          // Contenedor del Mensaje
          <div 
            key={msg.id} 
            className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* Burbuja del Mensaje */}
            <span className={`py-2 px-4 rounded-xl max-w-[80%] inline-block text-sm shadow-md transition-colors duration-300
              ${msg.sender === 'user' 
                ? 'bg-blue-500 text-white dark:bg-blue-600' // Mensaje de usuario: azul
                : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100' // Mensaje del sistema: gris
              }`
            }>
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      {/* --- */}

      {/* Área de Input y Botones */}
      <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2 mb-2">
        {/* Input de Texto */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta de programación..."
          disabled={isRecording}
          // Estilo: Flex-grow para ocupar espacio, relleno, borde redondeado.
          // Temas: Blanco/gris oscuro de fondo, borde sutil.
          className="flex-grow p-3 rounded-lg border border-gray-300 
                     focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
                     dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 disabled:opacity-50"
        />
        
        {/* Botón de Enviar */}
        <button 
          type="submit" 
          disabled={!input.trim() || isRecording || ws.current?.readyState !== 1} // 1 = WebSocket.OPEN
          // Estilo: Pading, fondo azul, texto blanco. Deshabilitado con opacidad.
          className="p-3 bg-blue-500 text-white rounded-lg font-semibold 
                     hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200"
        >
          Enviar Texto
        </button>
      </form>

      {/* Botón de Grabación de Voz */}
      <button 
        onClick={isRecording ? stopRecording : startRecording}
        disabled={ws.current?.readyState !== 1} // 1 = WebSocket.OPEN
        // Estilo dinámico según `isRecording`.
        className={`w-full p-3 rounded-lg font-semibold text-white mt-2 transition-all duration-300 
          ${isRecording 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-green-500 hover:bg-green-600'} 
          disabled:opacity-50`
        }
      >
        {isRecording ? 'Detener Grabación' : 'Iniciar Grabación de Voz'}
      </button>
      
      {/* Nota */}
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        *Nota: La conversión de Voz a Texto (STT) debe implementarse en esta sección para un uso real de voz.
      </p>

    </div>
  );
};

export default ChatInterface;