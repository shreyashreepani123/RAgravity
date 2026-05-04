from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

try:
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vector_store = Chroma(embedding_function=embeddings, persist_directory="./chroma_db")
    print("SUCCESS")
except Exception as e:
    import traceback
    traceback.print_exc()
