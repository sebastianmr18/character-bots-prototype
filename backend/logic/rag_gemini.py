import os
import chromadb
from google import genai
from google.genai.errors import APIError
from chromadb.utils import embedding_functions
from django.shortcuts import get_object_or_404

# Configuración
MODEL_NAME = "gemini-2.5-flash"
#CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "sheldon-dataset-rag"

EMBEDDING_FUNCTION = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

# TODO: funcion prompt system

def build_system_prompt_from_character(character):
    """
    Construye el 'system_prompt' usando la plantilla del personaje.
    """
    if not character:
        # Fallback si no hay personaje
        return "Eres un asistente de IA genérico."

    # Convertir las listas JSON a strings
    traits = ", ".join(character.key_traits)
    tics = ", ".join(character.speech_tics)

    # Esta es la plantilla de prompt estructurada
    prompt = f"""
    Tu deber es actuar como el personaje: {character.name}.

    [PERFIL DEL PERSONAJE]
    - Rol: {character.role}
    - Biografía: {character.biography}
    - Rasgos Clave: {traits}
    - Muletillas y Estilo de Habla: {tics}

    [REGLAS DE ACTUACIÓN]
    1. DEBES mantenerte SIEMPRE en el personaje de {character.name}.
    2. Usa los rasgos y el estilo de habla definidos.
    3. Responde de forma concisa, como lo haría el personaje.
    4. Basa tus respuestas factuales en el [CONTEXTO RAG] si se proporciona.
    """
    return prompt

MAX_OUTPUT_TOKENS = 800

def retrieve_context(query: str) -> str:
    """Busca en ChromaDB el contexto más relevante para la consulta."""
    try:
        '''client = chromadb.PersistentClient(path=CHROMA_PATH)
        collection = client.get_collection(
            name=COLLECTION_NAME,
            embedding_function=EMBEDDING_FUNCTION
        )'''

        client = chromadb.CloudClient(
            api_key=os.getenv("CHROMA_API_KEY"),
            tenant=os.getenv("CHROMA_TENANT"),
            database=os.getenv("CHROMA_DATABASE")
        )

        collection = client.get_collection(
            name=COLLECTION_NAME,
            embedding_function=EMBEDDING_FUNCTION
        )
        
        # Realiza la búsqueda de similitud (Top 3 resultados)
        results = collection.query(
            query_texts=[query],
            n_results=3,
            include=['documents']
        )
        
        # Concatena los documentos encontrados
        context = "\n".join(results['documents'][0])
        return context
        
    except Exception as e:
        print(f"Error al buscar en Chroma: {e}")
        return "" # Retorna vacío si falla la búsqueda

def generate_rag_response(user_query: str, history: list[dict], character) -> str:
    """Combina RAG con Gemini 2.5 Flash para generar una respuesta."""
    try:
        # Inicializa el cliente de Gemini
        client = genai.Client()
        
        # 1. Obtiene el contexto de RAG
        context = retrieve_context(user_query)

        # 2. Obtiene historial de chat:
        # El formato de Gemini API espera una lista de objetos de mensaje,
        # pero como estamos usando RAG, lo concatenaremos en el prompt de forma sencilla.

        system_instruction = build_system_prompt_from_character(character)
        
        # 💡 Creación del bloque de historial
        chat_history = []
        for msg in history:
            # Usamos el rol para diferenciar, el último mensaje es el actual
            role = "model" if msg["role"] == "assistant" else "user"
            chat_history.append({
            "role": role, 
            "parts": [
                # AHORA ES {"text": contenido}
                {"text": msg["content"]} 
            ]
        })
        #chat_history_str += "---\n"

        final_user_prompt = ''

        # 2. Crea el prompt final
        if context:
            final_user_prompt = (
                f"Contexto relevante RAG:\n---\n{context}\n---\n"
                f"Pregunta del usuario: {user_query}"
            )
        else:
            final_user_prompt = f"Pregunta del usuario: {user_query}"

            system_instruction += (
                " (Nota: Responde solo en base a tu conocimiento general y el historial, "
                "ya que el contexto RAG específico no está disponible)."
            )

        # 5. 💡 CORRECCIÓN: Añade el prompt final del usuario al historial
        chat_history.append({
        "role": "user", 
        "parts": [
            {"text": final_user_prompt} 
        ]
    })

        # 3. Llama a la API de Gemini
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=chat_history,
            config=genai.types.GenerateContentConfig(
                system_instruction=system_instruction,
                max_output_tokens=MAX_OUTPUT_TOKENS,
            )
        )
        
        return response.text
        
    except APIError as e:
        return f"Error de la API de Gemini: {e}"
    except Exception as e:
        return f"Ocurrió un error inesperado: {e}"

# Código de prueba
if __name__ == '__main__':
    
    # 1. Simula un historial vacío
    test_history = []
    
    # 2. Simula un objeto Character (usando SimpleNamespace para facilidad)
    from types import SimpleNamespace
    test_character = SimpleNamespace(
        name="Sheldon Cooper (Prueba)",
        role="Físico Teórico",
        biography="Un genio con dificultades sociales que ama los trenes.",
        key_traits=["Lógico", "Sarcástico", "Egoísta"],
        speech_tics=["Bazinga!", "Eso es mi sitio."]
    )
    
    # 3. Llama a la función con todos los argumentos
    query = "¿Como ganaste el premio Nobel?"
    response = generate_rag_response(query, test_history, test_character)
    print("--- RESPUESTA DE SHELDON COOPER CON RAG (MAX 800 TOKENS) ---")
    print(response[:400])