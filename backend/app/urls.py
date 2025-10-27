from django.urls import re_path, path
from . import views
from . import consumers

websocket_urlpatterns = [
    # Rutas WS inician con 'ws/'
    re_path(r'ws/chat/$', consumers.ChatConsumer.as_asgi()),
]

urlpatterns = [
    path("conversations/<str:conversation_id>/messages/", views.get_messages_by_conversation, name="get_conversation_messages"),
]