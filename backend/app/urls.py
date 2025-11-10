from django.urls import re_path, path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import consumers

router = DefaultRouter()
router.register(r'conversations', views.ConversationViewSet, basename='conversation')

urlpatterns = [
    # A. Ruta para listar personajes (Pendiente 1)
    path('characters/', views.CharacterListView.as_view(), name='character-list'),
    
    # B. Rutas generadas automáticamente por el ViewSet (Pendiente 2)
    # Esto manejará:
    # - /conversations/ (GET: listar, POST: crear)
    # - /conversations/{id}/ (GET: obtener, PUT/PATCH: actualizar, DELETE: borrar)
    path('', include(router.urls)),
    path("conversations/<str:conversation_id>/messages/", views.get_messages_by_conversation, name="get_conversation_messages"),
]

websocket_urlpatterns = [
    # Rutas WS inician con 'ws/'
    re_path(r'ws/chat/$', consumers.ChatConsumer.as_asgi()),
]
