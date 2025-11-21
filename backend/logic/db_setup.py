import chromadb
from chromadb.utils import embedding_functions
import pypdf
import os

def load_documents_from_pdf_dir(dir_path: str) -> tuple[list, list, list]:
    """
    Carga documentos de todos los archivos PDF en un directorio.
    Cada página del PDF se convierte en un documento separado.
    """
    documents = []
    metadatas = []
    ids = []
    doc_id_counter = 0

    if not os.path.isdir(dir_path):
        print(f"Error: El directorio '{dir_path}' no existe.")
        return documents, metadatas, ids

    for filename in os.listdir(dir_path):
        if filename.lower().endswith('.pdf'):
            filepath = os.path.join(dir_path, filename)
            
            try:
                reader = pypdf.PdfReader(filepath)
                
                for i, page in enumerate(reader.pages):
                    text = page.extract_text()
                    if text:
                        documents.append(text)
                        metadatas.append({
                            "source": filename,
                            "page": i + 1,
                            "type": "personaje_doc"
                        })
                        ids.append(f"doc_{doc_id_counter}")
                        doc_id_counter += 1
                        
            except Exception as e:
                print(f"Error al procesar el PDF {filename}: {e}")

    return documents, metadatas, ids

def initialize_chroma_db():
    """Inicializa ChromaDB, crea una colección y carga documentos PDF."""
    
    # Crea una instancia de ChromaDB local
    #client = chromadb.PersistentClient(path="./chroma_db")

    client = chromadb.CloudClient(
        api_key=os.getenv("CHROMA_API_KEY"),
        tenant=os.getenv("CHROMA_TENANT"),
        database=os.getenv("CHROMA_DATABASE")
    )
    
    # Embedding de all-MiniLM-L6-v2 para los embeddings de Chroma
    # para que Chroma pueda manejar la parte de vectorización.
    embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )

    # Crea la colección
    collection_name = "homero-simpson-dataset"
    try:
        client.delete_collection(name=collection_name)
    except:
        pass
    
    collection = client.get_or_create_collection(
        name=collection_name, 
        embedding_function=embedding_function
    )

    # Directorio donde se guardan los archivos PDF
    PDF_DIR = "./docs_personaje"

    # Carga los documentos
    if collection.count() == 0:
        print(f"Buscando PDFs en {PDF_DIR}...")
        
        documents, metadatas, ids = load_documents_from_pdf_dir(PDF_DIR)
        print(documents, metadatas, ids)
        
        if documents:
            print(f"Cargando {len(documents)} documentos (chunks de PDF) en Chroma...")
            collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            print("Carga de PDFs en Chroma completada.")
        else:
            print("No se encontraron documentos PDF o están vacíos.")
            
    else:
        print(f"Chroma ya contiene {collection.count()} documentos.")

    return client, collection_name

# Ejecuta la inicialización
if __name__ == '__main__':
    initialize_chroma_db()