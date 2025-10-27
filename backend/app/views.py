from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Message
from .serializers import MessageSerializer

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
