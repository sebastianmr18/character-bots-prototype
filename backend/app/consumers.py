import json
from channels.generic.websocket import AsyncWebsocketConsumer
import base64 # 💡 Necesario para codificar/decodificar el audio
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async

from logic.rag_gemini import generate_rag_response
from logic.tts_elevenlabs import generate_audio_from_text 

class ChatConsumer(AsyncWebsocketConsumer):
    # 1. CONEXIÓN
    async def connect(self):
        """Llamado cuando la conexión WebSocket es establecida."""
        self.room_name = 'chatbot_room'
        self.room_group_name = 'chat_%s' % self.room_name

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        await self.send(text_data=json.dumps({
            'type': 'status',
            'message': 'Conexión con el backend establecida. ¡Hola!'
        }))

    # 2. DESCONEXIÓN
    async def disconnect(self, close_code):
        """Llamado cuando la conexión WebSocket es cerrada."""
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # 3. RECEPCIÓN DE MENSAJE DEL CLIENTE
    async def receive(self, text_data):
        """Llamado cuando se recibe un mensaje del cliente (Next.js)."""
        text_data_json = json.loads(text_data)
        user_text = text_data_json['text']
        
        # Le indicamos al cliente que la respuesta está siendo procesada
        await self.send(text_data=json.dumps({
            'type': 'status',
            'message': 'Procesando tu solicitud...'
        }))
                
        gemini_response_text, audio_data_base64 = await sync_to_async(
            self.get_rag_gemini_tts_response, 
            thread_sensitive=True
        )(user_text)

        # 4. ENVÍO DE RESPUESTA AL CLIENTE
        # Envía la respuesta de texto
        await self.send(text_data=json.dumps({
            'type': 'text_response',
            'text': gemini_response_text
        }))

        # Envía el audio (como Base64)
        if audio_data_base64:
             await self.send(text_data=json.dumps({
                'type': 'audio_response',
                'audio': audio_data_base64
            }))

    # FUNCIÓN DE LÓGICA DE NEGOCIO (SINCRONA)
    def get_rag_gemini_tts_response(self, user_text):
        """
        Función síncrona que coordina RAG, Gemini y TTS.
        """
        
        # --- 1. RAG y Generación con Gemini ---
        try:
            gemini_response_text = generate_rag_response(user_text)
        except Exception as e:
            print(f"Error en RAG/Gemini: {e}")
            gemini_response_text = "Disculpa, hubo un problema al procesar tu solicitud con el modelo de IA."

        
        # --- 2. Conversión de Texto a Voz (TTS) con ElevenLabs ---
        audio_data_base64 = None
        try:
            raw_audio_data = generate_audio_from_text(gemini_response_text) 
            audio_data_base64 = base64.b64encode(raw_audio_data).decode('utf-8')
            
        except (ValueError) as e:
            print(f"Error en la generación de audio (ElevenLabs): {e}")
            audio_data_base64 = None
        except Exception as e:
            print(f"Error inesperado durante TTS: {e}")
            audio_data_base64 = None

        return gemini_response_text, audio_data_base64
