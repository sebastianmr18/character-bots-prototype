from django.db import models
import uuid

# Create your models here.
class Conversation(models.Model):
    # Campo clave que usaremos para que coincida con el ID de localStorage.
    # Usamos primary_key=True y default=uuid.uuid4 para que Django lo cree
    # automáticamente si el frontend no envía uno, aunque el plan es enviarlo.
    # Es crucial que sea editable (no auto-generado SIEMPRE)
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=True
    )
    
    # Campo opcional para asociar a un usuario registrado, si lo hubiera.
    # user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Conversación"
        verbose_name_plural = "Conversaciones"
        ordering = ['-created_at']

    def __str__(self):
        return f"Conversación {self.id}"
    
class Message(models.Model):
    ROLE_CHOICES = (
        ('user', 'User'),       # Mensaje enviado por el cliente
        ('assistant', 'Assistant'), # Respuesta generada por el LLM/Bot
    )

    # 1. Enlace a la Conversación (Contexto)
    conversation = models.ForeignKey(
        Conversation, 
        on_delete=models.CASCADE, 
        related_name='messages' # Permite acceder a los mensajes desde la conversación
    )
    
    # 2. Rol
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    
    # 3. Contenido
    content = models.TextField()
    
    # 4. Metadatos
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Mensaje"
        verbose_name_plural = "Mensajes"
        # Ordenar por timestamp para recuperar el historial en orden cronológico
        ordering = ['timestamp'] 

    def __str__(self):
        return f"{self.role.capitalize()}: {self.content[:50]}..."