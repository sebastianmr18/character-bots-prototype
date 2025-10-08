import json
from channels.generic.websocket import AsyncWebsocketConsumer
import base64 # 💡 Necesario para codificar/decodificar el audio
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async

from logic.rag_gemini import generate_rag_response
from logic.tts_elevenlabs import generate_audio_from_text
from logic.stt_elevenlabs import transcribe_audio_from_base64 

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
        """Llamado cuando se recibe un mensaje del cliente."""
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type', 'text')
        
        if message_type == 'audio':
            # Manejar audio del frontend
            await self.handle_audio_message(text_data_json)
        else:
            # Manejar texto del frontend (comportamiento original)
            await self.handle_text_message(text_data_json)
    
    async def handle_text_message(self, text_data_json):
        """Maneja mensajes de texto del frontend."""
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
    
    async def handle_audio_message(self, text_data_json):
        """Maneja mensajes de audio del frontend."""
        audio_base64 = text_data_json['audio']
        
        # Le indicamos al cliente que el audio está siendo procesado
        await self.send(text_data=json.dumps({
            'type': 'status',
            'message': 'Transcribiendo audio...'
        }))
        
        try:
            # Transcribir audio a texto
            transcribed_text = await sync_to_async(
                transcribe_audio_from_base64,
                thread_sensitive=True
            )(audio_base64)
            
            # Enviar transcripción al cliente
            await self.send(text_data=json.dumps({
                'type': 'transcription',
                'text': transcribed_text
            }))
            
            # Le indicamos al cliente que la respuesta está siendo procesada
            await self.send(text_data=json.dumps({
                'type': 'status',
                'message': 'Procesando tu solicitud...'
            }))
            
            # Procesar la transcripción con RAG + Gemini + TTS
            gemini_response_text, audio_data_base64 = await sync_to_async(
                self.get_rag_gemini_tts_response, 
                thread_sensitive=True
            )(transcribed_text)

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
                
        except Exception as e:
            print(f"Error procesando audio: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Error al procesar el audio: {str(e)}'
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
        if gemini_response_text and gemini_response_text.strip():
            try:
                raw_audio_data = generate_audio_from_text(gemini_response_text) 
                audio_data_base64 = base64.b64encode(raw_audio_data).decode('utf-8')
            except (ValueError) as e:
                print(f"Error en la generación de audio (ElevenLabs): {e}")
                audio_data_base64 = None 
            except Exception as e:
                print(f"Error inesperado durante TTS: {e}")
                audio_data_base64 = None
        else:
            print("AVISO: El LLM devolvió un texto vacío. Se omitió la llamada a ElevenLabs (422 evitado).")
            gemini_response_text = "El modelo de IA no pudo generar una respuesta clara."


        return gemini_response_text, audio_data_base64
