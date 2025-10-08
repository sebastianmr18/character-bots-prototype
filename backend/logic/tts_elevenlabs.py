import os
from elevenlabs.client import ElevenLabs
from elevenlabs.play import play

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

def generate_audio_from_text(text: str) -> bytes:
    """
    Convierte el texto en datos de audio binario usando ElevenLabs.
    """
    elevenlabs_client = get_elevenlabs_client()
    
    audio = elevenlabs_client.text_to_speech.convert(
        text=text,
        voice_id="JBFqnCBsd6RMkjVDRZzb",
        model_id="eleven_multilingual_v2",
        output_format="mp3_44100_128",
    )
    audio_bytes = b"".join(audio)
    return audio_bytes

# Código de prueba
if __name__ == '__main__':
    try:
        audio_bytes = generate_audio_from_text("Esta es una prueba de la integración de ElevenLabs.")
        # Guarda el archivo para verificar
        with open("prueba_tts.mp3", "wb") as f:
            f.write(audio_bytes)
        print("Audio de prueba generado exitosamente como prueba_tts.mp3")
    except Exception as e:
        print(f"Fallo la prueba de ElevenLabs: {e}")