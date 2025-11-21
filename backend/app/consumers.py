import json
from channels.generic.websocket import AsyncWebsocketConsumer
import base64 # 💡 Necesario para codificar/decodificar el audio
from asgiref.sync import sync_to_async
from django.db.models import ObjectDoesNotExist
from django.core.exceptions import ValidationError
import uuid

from logic.rag_gemini import generate_rag_response
from logic.tts_elevenlabs import generate_audio_from_text
from logic.stt_elevenlabs import transcribe_audio_from_base64 

from app.models import Conversation, Message, Character

MAX_HISTORY_MESSAGES = 6 # Los últimos 6 mensajes (3 turnos completos)

@sync_to_async
def get_or_create_conversation_and_history(conversation_id_str, character_id_str):
    """Busca o crea la conversación y recupera el historial reciente."""
    
    # 1. Validar UUID
    if not conversation_id_str or not isinstance(conversation_id_str, str):
        # Si no se proporciona ID (o es inválido), se considera una nueva sesión sin ID
        raise ValidationError("El ID de conversación proporcionado es inválido o nulo.")
        
    # 2. Buscar/Crear conversación
    try:
        # Intentamos obtener o crear la conversación con el ID enviado por el frontend
        conversation_uuid = uuid.UUID(conversation_id_str)
        conversation, created = Conversation.objects.select_related('character').get_or_create(id=conversation_uuid)
    except ValueError:
        # Si el string no es un UUID válido
        raise ValidationError("El ID de conversación no tiene el formato UUID correcto.")
        

    # 3. Asignar personaje si es una conversación nueva
    character = conversation.character

    # Caso: Conversación es nueva O no tiene personaje asignado AÚN
    if created or not character:
        # Si no tiene personaje (nuevo o antiguo sin asignar),
        # asigna el PRIMER personaje que encuentre como default.
        # TODO: A futuro, el frontend debería enviar un 'character_id'

        # intentar usar el character_id_str enviado por el frontend
        if character_id_str:
            try:
                character_uuid = uuid.UUID(character_id_str)
                new_character = Character.objects.get(id=character_uuid)
                
                # Asignar y guardar
                conversation.character = new_character
                conversation.save()
                character = new_character # Usar el nuevo personaje
                
            except (ValueError, ObjectDoesNotExist):
                # Si el character_id es inválido o no existe, intentar el default
                print(f"AVISO: character_id '{character_id_str}' es inválido o no existe. Intentando default.")
                
        # Segundo, si la asignación falló (o no se envió ID), usar el default (Character.objects.first())
        if not conversation.character: # Chequea de nuevo si sigue siendo None
            try:
                default_character = Character.objects.first()
                if default_character:
                    conversation.character = default_character
                    conversation.save()
                    character = default_character
                else:
                    print("ERROR: No se encontraron personajes en la base de datos.")
                    # Si no hay personajes, 'character' es None
            except Exception as e:
                print(f"Error al asignar personaje default: {e}")
                character = None

    # 4. Obtener el historial de la ventana deslizante
    # Recuperamos los últimos N mensajes, excluyendo el mensaje actual
    history_qs = conversation.messages.all().order_by('-timestamp')[:MAX_HISTORY_MESSAGES]
    
    # Formateamos el historial en el formato que espera generate_rag_response
    history = [
        {"role": m.role, "content": m.content} 
        for m in reversed(history_qs) # Se invierte para que el más antiguo vaya primero
    ]
    
    return conversation, history, character

@sync_to_async
def save_messages(conversation, user_text, llm_response_text):
    """Guarda los mensajes del usuario y del LLM."""
    
    # 1. Guardar mensaje del usuario
    Message.objects.create(
        conversation=conversation,
        role='user',
        content=user_text
    )
    
    # 2. Guardar respuesta del bot
    Message.objects.create(
        conversation=conversation,
        role='assistant',
        content=llm_response_text
    )
    # No devuelve nada, solo realiza la acción

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
        print(f"Mensaje WS recibido: {text_data[:100]}...")
        text_data_json = json.loads(text_data)
        message_type = text_data_json.get('type')
        
        # 💡 Aseguramos que el conversation_id siempre esté presente
        conversation_id = text_data_json.get('conversation_id')
        character_id = text_data_json.get('character_id')

        if not conversation_id:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Error: Falta el conversation_id. ¡Bazinga! La lógica es defectuosa.'
            }))
            return

        # Guardamos el ID en el consumer para uso posterior
        self.conversation_id = conversation_id
        self.character_id = character_id 

        if message_type == 'audio' and 'audio' in text_data_json:
            # --- NUEVO FLUJO (REGLA 1) ---
            # Manejar audio (SOLO TRANSCRIPCIÓN)
            await self.handle_transcribe_request(text_data_json)
        elif message_type == 'text' and 'text' in text_data_json:
            # --- FLUJO ÚNICO DE CHAT (REGLA 2) ---
            # Manejar texto (RAG/LLM/TTS y Guardado)
            await self.handle_text_message(text_data_json)
        elif message_type == 'init':
            # Mensaje de inicialización, no hacer nada especial por ahora
            await self.send(text_data=json.dumps({
                'type': 'status',
                'message': 'Sesión iniciada correctamente.'
            }))
        else:
            # Tipo de mensaje desconocido o datos faltantes
            print(f"Mensaje WS ignorado: Tipo '{message_type}' o faltan datos.")

    # 5. NUEVO MANEJADOR DE AUDIO (SOLO TRANSCRIPCIÓN - REGLA 1)
    async def handle_transcribe_request(self, text_data_json):
        """
        Maneja mensajes de audio.
        Solo transcribe y devuelve el texto. No llama al LLM ni guarda.
        """
        print("handle_transcribe_request (STT Only) recibido...")
        audio_base64 = text_data_json['audio']
        
        await self.send(text_data=json.dumps({
            'type': 'status',
            'message': 'Transcribiendo audio...'
        }))
        
        try:
            # 1. Transcribir audio a texto
            transcribed_text = await sync_to_async(
                transcribe_audio_from_base64,
                thread_sensitive=True
            )(audio_base64)
            
            # 2. Enviar transcripción al cliente (FIN DEL FLUJO)
            await self.send(text_data=json.dumps({
                'type': 'transcription_result', # Tipo de mensaje solicitado
                'text': transcribed_text
            }))
            
        except Exception as e:
            print(f"Error procesando audio (transcribe_only): {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Error al transcribir el audio: {str(e)}'
            }))
    
    async def handle_text_message(self, text_data_json):
        """Maneja mensajes de texto del frontend."""
        print(f"handle_text_message recibido: {text_data_json}")
        user_text = text_data_json['text']
        
        # Le indicamos al cliente que la respuesta está siendo procesada
        await self.send(text_data=json.dumps({
            'type': 'status',
            'message': 'Procesando tu solicitud...'
        }))

        try:
            # 💡 1. Obtener Conversación e Historial (Persistencia y Contexto)
            conversation, history, character = await get_or_create_conversation_and_history(self.conversation_id, self.character_id)

            # 💡 2. Obtener Respuesta con RAG/Gemini/TTS, pasando el historial
            gemini_response_text, audio_data_base64 = await sync_to_async(
                self.get_rag_gemini_tts_response, 
                thread_sensitive=True
            )(user_text, history, character) # 💡 Se pasa el historial

            # 💡 3. Guardar Mensajes (Persistencia)
            await save_messages(conversation, user_text, gemini_response_text)
            
            # 4. ENVÍO DE RESPUESTA AL CLIENTE (sin cambios)
            await self.send(text_data=json.dumps({
                'type': 'text_response',
                'text': gemini_response_text,
                'conversation_id': self.conversation_id # Opcional: reenviar el ID
            }))

            if audio_data_base64:
                await self.send(text_data=json.dumps({
                    'type': 'audio_response',
                    'audio': audio_data_base64
                }))
        except ValidationError as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Error de validación del chat: {str(e)}'
            }))
        except Exception as e:
            print(f"Error general en handle_text_message: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Error interno del servidor: {e}'
            }))
                
        '''gemini_response_text, audio_data_base64 = await sync_to_async(
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
            }))'''
    
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

            # 💡 1. Obtener Conversación e Historial (Persistencia y Contexto)
            conversation, history, character = await get_or_create_conversation_and_history(self.conversation_id, self.character_id) # 💡 NUEVO
            
            # 💡 2. Procesar la transcripción con RAG + Gemini + TTS, pasando el historial
            gemini_response_text, audio_data_base64 = await sync_to_async(
                self.get_rag_gemini_tts_response, 
                thread_sensitive=True
            )(transcribed_text, history, character) # 💡 Se pasa el historial

            # 💡 3. Guardar Mensajes (Persistencia)
            await save_messages(conversation, transcribed_text, gemini_response_text) # 💡 NUEVO
            
            # Envía la respuesta de texto (sin cambios)
            await self.send(text_data=json.dumps({
                'type': 'text_response',
                'text': gemini_response_text
            }))

            # Envía el audio (como Base64) (sin cambios)
            if audio_data_base64:
                await self.send(text_data=json.dumps({
                    'type': 'audio_response',
                    'audio': audio_data_base64
                }))
            
            '''# Procesar la transcripción con RAG + Gemini + TTS
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
                }))'''
                
        except ValidationError as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Error de validación del chat: {str(e)}'
            }))
        except Exception as e:
            print(f"Error procesando audio: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': f'Error al procesar el audio: {str(e)}'
            }))

    # FUNCIÓN DE LÓGICA DE NEGOCIO (SINCRONA)
    def get_rag_gemini_tts_response(self, user_text, history, character):
        """
        Función síncrona que coordina RAG, Gemini y TTS, usando historial.
        """
        
        # --- 1. RAG y Generación con Gemini ---
        try:
            gemini_response_text = generate_rag_response(user_text, history, character)
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
