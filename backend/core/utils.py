from chromadb.utils import embedding_functions

def get_embedding_function():
    """Retorna la función de embedding, inicializándola solo si es necesario."""
    # La carga del modelo ocurre aquí, pero solo cuando se llama a esta función.
    return embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )