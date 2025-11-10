from rest_framework import serializers
from .models import Character, Conversation, Message

class CharacterSerializer(serializers.ModelSerializer):
    """Serializador para el modelo Character, usado para la lista de personajes."""
    class Meta:
        model = Character
        # Incluimos todos los campos para que el frontend tenga la información completa
        fields = ['id', 'name', 'role', 'biography', 'key_traits', 'speech_tics']

class MessageSerializer(serializers.ModelSerializer):
    """Serializador para el modelo Message."""
    class Meta:
        model = Message
        fields = ['role', 'content', 'timestamp']
        
class ConversationSerializer(serializers.ModelSerializer):
    """Serializador para el modelo Conversation, incluyendo su historial."""
    # Usamos CharacterSerializer para anidar los detalles del personaje
    character = CharacterSerializer(read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Conversation
        fields = ['id', 'created_at', 'character', 'messages']
        read_only_fields = ['created_at', 'messages']