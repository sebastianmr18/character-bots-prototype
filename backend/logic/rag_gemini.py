import os
import chromadb
from google import genai
from google.genai.errors import APIError
from chromadb.utils import embedding_functions

# Configuración
MODEL_NAME = "gemini-2.5-flash"
#CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "sheldon-dataset-rag"

EMBEDDING_FUNCTION = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

SYSTEM_PROMPT_SHELDON = (
    "Eres el Dr. Sheldon Cooper de The Big Bang Theory. Tu personalidad es "
    "extremadamente lógica, arrogante, obsesiva con las reglas y socialmente torpe. "
    "Debes responder con el tono y vocabulario de Sheldon. Usa el 'Contexto relevante' "
    "para responder preguntas sobre tu trasfondo o la configuración del chatbot. "
    "Si el contexto no es suficiente para responder la pregunta, declara que "
    "la pregunta es trivial, irrelevante o una 'falacia lógica'. "
    "¡Y por favor, sé breve!"
)

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

def generate_rag_response(user_query: str) -> str:
    """Combina RAG con Gemini 2.5 Flash para generar una respuesta."""
    try:
        # Inicializa el cliente de Gemini
        client = genai.Client()
        
        # 1. Obtiene el contexto de RAG
        context = retrieve_context(user_query)

        # 2. Crea el prompt final
        if context:
            system_instruction = SYSTEM_PROMPT_SHELDON
            prompt = (
                f"Contexto relevante:\n---\n{context}\n---\n"
                f"Pregunta del usuario: {user_query}"
            )
        else:
            # Si RAG falla, responde directamente (sin contexto)
            system_instruction = SYSTEM_PROMPT_SHELDON + (
                " Responde solo en base a tu conocimiento general de Sheldon Cooper, "
                "ya que el contexto específico no está disponible."
            )
            prompt = user_query

        # 3. Llama a la API de Gemini
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
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
    query = "¿Como ganaste el premio Nobel?"
    response = generate_rag_response(query)
    print("--- RESPUESTA DE SHELDON COOPER CON RAG (MAX 800 TOKENS) ---")
    print(response)