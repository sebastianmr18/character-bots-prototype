from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, viewsets, generics
from .models import Message, Character, Conversation
from .serializers import MessageSerializer, CharacterSerializer, ConversationSerializer

# -----------------
# 1. LISTADO DE PERSONAJES (Pendiente 1)
# -----------------
class CharacterListView(generics.ListAPIView):
    """Endpoint para listar todos los personajes disponibles."""
    queryset = Character.objects.all().order_by('name')
    serializer_class = CharacterSerializer

# -----------------
# 2. CONVERSACIONES (Complemento para Pendiente 2)
# -----------------
class ConversationViewSet(viewsets.ModelViewSet):
    """Endpoint REST para gestión (creación/recuperación) de conversaciones."""
    queryset = Conversation.objects.all().select_related('character').order_by('-created_at')
    serializer_class = ConversationSerializer
    lookup_field = 'id' # Ya que el ID es un UUID
    
    # Nota: Si quisieras CREAR una conversación por REST, debes asegurarte
    # de enviar el 'character_id' en el cuerpo del POST para que el Serializer
    # lo maneje correctamente como una FK.

@api_view(["GET"])
def get_messages_by_conversation(request, conversation_id):
    """
    Devuelve todos los mensajes asociados a un conversation_id.
    """
    messages = Message.objects.filter(conversation_id=conversation_id).order_by("timestamp")
    
    if not messages.exists():
        return Response([], status=status.HTTP_200_OK)

    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)
