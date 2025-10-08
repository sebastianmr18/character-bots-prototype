import os
import base64
from elevenlabs.client import ElevenLabs
import requests
import io

client = None

def get_elevenlabs_client():
    """Inicializa y retorna el cliente ElevenLabs si aún no está inicializado."""
    global client
    if client is None:
        api_key = os.getenv("ELEVENLABS_API_KEY")
        if not api_key:
            raise ValueError("La variable de entorno ELEVENLABS_API_KEY no está configurada.")
        
        client = ElevenLabs(api_key=api_key)
        
    return client

def transcribe_audio_from_base64(audio_base64: str) -> str:
    """
    Convierte audio codificado en Base64 a texto usando ElevenLabs STT API.
    
    Args:
        audio_base64: Audio codificado en Base64 (formato webm/mp3)
    
    Returns:
        str: Texto transcrito del audio
    """
    try:
        # Decodificar el audio desde Base64
        audio_data = base64.b64decode(audio_base64)
        
        # Obtener API key de ElevenLabs
        api_key = os.getenv("ELEVENLABS_API_KEY")
        if not api_key:
            raise ValueError("La variable de entorno ELEVENLABS_API_KEY no está configurada.")
        
        # URL de la API de ElevenLabs STT
        url = "https://api.elevenlabs.io/v1/speech-to-text"
        
        # Headers para la petición
        headers = {
            "xi-api-key": api_key,
        }
        
        # Preparar el archivo de audio para la petición
        files = {
            "file": ("audio.webm", io.BytesIO(audio_data), "audio/webm")
        }
        
        # Parámetros de la petición según la documentación
        data = {
            "model_id": "scribe_v1",  # Modelo de STT de ElevenLabs
            "language_code": "es",     # Idioma español
            "tag_audio_events": "true",  # Etiquetar eventos de audio
            "timestamps_granularity": "word",  # Timestamps a nivel de palabra
        }
        
        # Realizar la petición POST
        response = requests.post(url, headers=headers, files=files, data=data)
        
        if response.status_code == 200:
            result = response.json()
            return result.get("text", "")
        else:
            raise Exception(f"Error en la API de ElevenLabs STT: {response.status_code} - {response.text}")
        
    except Exception as e:
        print(f"Error en la transcripción de audio (ElevenLabs STT): {e}")
        raise ValueError(f"Error al transcribir el audio: {str(e)}")

def transcribe_audio_from_bytes(audio_bytes: bytes) -> str:
    """
    Convierte audio en bytes a texto usando ElevenLabs STT API.
    
    Args:
        audio_bytes: Datos de audio en formato bytes
    
    Returns:
        str: Texto transcrito del audio
    """
    try:
        # Obtener API key de ElevenLabs
        api_key = os.getenv("ELEVENLABS_API_KEY")
        if not api_key:
            raise ValueError("La variable de entorno ELEVENLABS_API_KEY no está configurada.")
        
        # URL de la API de ElevenLabs STT
        url = "https://api.elevenlabs.io/v1/speech-to-text"
        
        # Headers para la petición
        headers = {
            "xi-api-key": api_key,
        }
        
        # Preparar el archivo de audio para la petición
        files = {
            "file": ("audio.webm", io.BytesIO(audio_bytes), "audio/webm")
        }
        
        # Parámetros de la petición según la documentación
        data = {
            "model_id": "scribe_v1",  # Modelo de STT de ElevenLabs
            "language_code": "es",     # Idioma español
            "tag_audio_events": "true",  # Etiquetar eventos de audio
            "timestamps_granularity": "word",  # Timestamps a nivel de palabra
        }
        
        # Realizar la petición POST
        response = requests.post(url, headers=headers, files=files, data=data)
        
        if response.status_code == 200:
            result = response.json()
            return result.get("text", "")
        else:
            raise Exception(f"Error en la API de ElevenLabs STT: {response.status_code} - {response.text}")
        
    except Exception as e:
        print(f"Error en la transcripción de audio (ElevenLabs STT): {e}")
        raise ValueError(f"Error al transcribir el audio: {str(e)}")

# Código de prueba
if __name__ == '__main__':
    try:
        # Ejemplo de uso con archivo de audio
        with open("prueba_audio.webm", "rb") as f:
            audio_data = f.read()
        
        transcription = transcribe_audio_from_bytes(audio_data)
        print(f"Transcripción: {transcription}")
        
    except FileNotFoundError:
        print("Archivo de prueba no encontrado. Crea un archivo 'prueba_audio.webm' para probar.")
    except Exception as e:
        print(f"Fallo la prueba de STT: {e}")
