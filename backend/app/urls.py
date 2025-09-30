from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    # Rutas WS inician con 'ws/'
    re_path(r'ws/chat/$', consumers.ChatConsumer.as_asgi()),
]