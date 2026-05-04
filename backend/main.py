"""
RAGravity – FastAPI RAG Backend
================================
Stack:
  LLM        : Groq  (llama-3.1-8b-instant)   – ultra-fast inference
  Embeddings : HuggingFace all-MiniLM-L6-v2    – runs 100% locally, free
  Vector DB  : ChromaDB                         – local, persistent
  Parser     : PyPDF / TextLoader (LangChain)

Flow:
  Upload → load → chunk (1000 chars / 200 overlap) → embed → store in ChromaDB
  Query  → embed query → similarity search top-5 → strict RAG prompt → Groq LLM → answer

Fixes:
  - Uploading the same file again now REPLACES its old chunks (no duplicates)
  - /status returns real chunk count so frontend can enable chat on page load
  - /clear wipes the DB cleanly
  - The RAG prompt is maximally strict to prevent hallucinations
"""

import os
import tempfile
import shutil
import logging
from dotenv import load_dotenv

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import uvicorn

# LangChain imports
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

# ─────────────────────────────────────────────────────────
load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
log = logging.getLogger("ragravity")
# ─────────────────────────────────────────────────────────

app = FastAPI(title="RAGravity API", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────
# Vector Store – persist between restarts
# ─────────────────────────────────────────────────────────
DB_DIR = "./chroma_db"
os.makedirs(DB_DIR, exist_ok=True)

try:
    log.info("Loading HuggingFace embeddings (all-MiniLM-L6-v2)...")
    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )
    vector_store = Chroma(
        embedding_function=embeddings,
        persist_directory=DB_DIR,
        collection_name="ragravity_docs",
    )
    count = vector_store._collection.count()
    log.info(f"ChromaDB ready. Existing chunks: {count}")
except Exception as exc:
    import traceback; traceback.print_exc()
    log.error(f"FATAL: Could not init embeddings/ChromaDB: {exc}")
    vector_store = None


# ─────────────────────────────────────────────────────────
# Helper: delete all chunks belonging to a specific file
# ─────────────────────────────────────────────────────────
def _delete_file_chunks(filename: str):
    """Remove all previously stored chunks for this filename."""
    try:
        results = vector_store._collection.get(
            where={"source_file": filename}
        )
        ids = results.get("ids", [])
        if ids:
            vector_store._collection.delete(ids=ids)
            log.info(f"  Deleted {len(ids)} old chunks for '{filename}'")
    except Exception as e:
        log.warning(f"  Could not delete old chunks for '{filename}': {e}")


# ─────────────────────────────────────────────────────────
# Shared LLM instance
# ─────────────────────────────────────────────────────────
def get_llm() -> ChatGroq:
    return ChatGroq(
        model_name="llama-3.1-8b-instant",
        temperature=0,
        max_tokens=2048,
    )


# ─────────────────────────────────────────────────────────
# Session chat history  (in-memory, keyed by session_id)
# ─────────────────────────────────────────────────────────
_sessions: dict[str, list[dict]] = {}

def get_history(session_id: str) -> list[dict]:
    if session_id not in _sessions:
        _sessions[session_id] = []
    return _sessions[session_id]


# ─────────────────────────────────────────────────────────
# Request models
# ─────────────────────────────────────────────────────────
class QueryRequest(BaseModel):
    query: str
    session_id: str = "default"


# ─────────────────────────────────────────────────────────
# /upload  ─ Ingest a PDF or TXT file
# ─────────────────────────────────────────────────────────
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    1. Delete any existing chunks for this filename (prevents duplicates).
    2. Save the uploaded file to a temp location.
    3. Load it with the appropriate LangChain loader.
    4. Split into chunks (1000 chars, 200 overlap).
    5. Embed each chunk and store in ChromaDB.
    """
    if vector_store is None:
        raise HTTPException(status_code=503, detail="Vector store not available.")

    fname = file.filename.lower()
    if fname.endswith(".pdf"):
        suffix = ".pdf"
    elif fname.endswith(".txt"):
        suffix = ".txt"
    else:
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported.")

    # Save to temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        # ── Step 0: Remove old chunks for this file ───────────
        _delete_file_chunks(file.filename)

        # ── Step 1: Load ──────────────────────────────────────
        log.info(f"Loading '{file.filename}' from {tmp_path}")
        if suffix == ".pdf":
            loader = PyPDFLoader(tmp_path)
        else:
            loader = TextLoader(tmp_path, encoding="utf-8")

        raw_docs = loader.load()

        if not raw_docs:
            raise HTTPException(status_code=400, detail="Could not extract any text from the file.")

        # Stamp every page with the original filename
        for doc in raw_docs:
            doc.metadata["source_file"] = file.filename

        log.info(f"  Loaded {len(raw_docs)} page(s)")

        # ── Step 2: Chunk ─────────────────────────────────────
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ".", " ", ""],
        )
        chunks = splitter.split_documents(raw_docs)

        if not chunks:
            raise HTTPException(status_code=400, detail="Text splitting produced no chunks.")

        log.info(f"  Split into {len(chunks)} chunks")

        # ── Step 3: Embed + Store ─────────────────────────────
        vector_store.add_documents(chunks)
        total = vector_store._collection.count()
        log.info(f"  Stored. Total chunks in DB: {total}")

        return {
            "message": f"'{file.filename}' processed successfully.",
            "chunks": len(chunks),
            "total_in_db": total,
        }

    except HTTPException:
        raise
    except Exception as exc:
        log.error(f"Upload error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
    finally:
        os.remove(tmp_path)


# ─────────────────────────────────────────────────────────
# /query  ─ RAG query pipeline
# ─────────────────────────────────────────────────────────
@app.post("/query")
async def query_rag(req: QueryRequest):
    """
    1. Embed the query.
    2. Retrieve top-5 most similar chunks from ChromaDB.
    3. Build a strict RAG prompt (context + history + question).
    4. Call Groq LLM and return the grounded answer.
    """
    if vector_store is None:
        raise HTTPException(status_code=503, detail="Vector store not available.")

    # Guard: nothing uploaded yet
    total = vector_store._collection.count()
    if total == 0:
        return {
            "answer": (
                "⚠️ No documents have been uploaded yet. "
                "Please upload a PDF or TXT file first, then ask your question."
            ),
            "sources": [],
        }

    try:
        # ── Step 1: Retrieve relevant chunks ─────────────────
        log.info(f"Query: '{req.query}' | DB chunks: {total}")
        docs = vector_store.similarity_search(req.query, k=6)

        if not docs:
            return {
                "answer": "I could not find relevant information in the uploaded documents for your question.",
                "sources": [],
            }

        log.info(f"  Retrieved {len(docs)} chunk(s)")

        # ── Step 2: Build context string ──────────────────────
        context_parts = []
        for i, doc in enumerate(docs, 1):
            src = doc.metadata.get("source_file", "unknown")
            pg  = doc.metadata.get("page", "?")
            context_parts.append(
                f"[SOURCE {i} | File: {src} | Page: {pg}]\n{doc.page_content.strip()}"
            )

        context_text = "\n\n---\n\n".join(context_parts)

        # ── Step 3: Attach chat history ───────────────────────
        history = get_history(req.session_id)
        history_text = ""
        if history:
            history_text = "\n".join(
                f"{turn['role']}: {turn['content']}" for turn in history[-6:]
            )

        # ── Step 4: Strict RAG prompt ─────────────────────────
        system_content = f"""You are a RAG (Retrieval-Augmented Generation) assistant. You must ONLY answer using the DOCUMENT CONTEXT below. You have NO other knowledge.

=== ABSOLUTE RULES ===
1. ONLY use information from the DOCUMENT CONTEXT below. Never use general knowledge.
2. If the answer is NOT in the document context, respond with: "This information is not present in the uploaded documents."
3. Do NOT mention file names, page numbers, source labels, or any citation like (SOURCE 1 | File: ... | Page: ...) anywhere in your answer.
4. Be detailed, precise, and factual.
5. Do NOT make up information. Do NOT say things like "I'd be happy to provide general information."

=== DOCUMENT CONTEXT (your ONLY source of truth) ===
{context_text}"""

        messages = [SystemMessage(content=system_content)]
        
        if history:
            for turn in history[-6:]:
                if turn['role'] == 'User':
                    messages.append(HumanMessage(content=turn['content']))
                elif turn['role'] == 'Assistant':
                    messages.append(AIMessage(content=turn['content']))

        messages.append(HumanMessage(content=req.query))

        # ── Step 5: Call Groq LLM ─────────────────────────────
        llm = get_llm()
        response = llm.invoke(messages)
        answer = response.content.strip()
        log.info(f"  Answer generated ({len(answer)} chars)")

        # ── Step 6: Save to session memory ────────────────────
        history.append({"role": "User",      "content": req.query})
        history.append({"role": "Assistant", "content": answer})

        # ── Step 7: Build deduplicated sources list ───────────
        sources = []
        seen = set()
        for doc in docs:
            sf   = doc.metadata.get("source_file") or os.path.basename(doc.metadata.get("source", "Unknown"))
            page = doc.metadata.get("page", "N/A")
            key  = f"{sf}||{page}"
            if key not in seen:
                seen.add(key)
                sources.append({"source_file": sf, "page": page})

        return {"answer": answer, "sources": sources}

    except Exception as exc:
        log.error(f"Query error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


# ─────────────────────────────────────────────────────────
# /status  – health check + DB info
# ─────────────────────────────────────────────────────────
@app.get("/status")
async def status():
    if vector_store is None:
        return {"status": "error", "chunks_in_db": 0, "vector_store_ready": False, "files": []}
    
    count = vector_store._collection.count()
    
    # Get list of unique files in DB
    files = []
    try:
        results = vector_store._collection.get(include=["metadatas"])
        seen_files = set()
        for meta in results.get("metadatas", []):
            sf = meta.get("source_file", "")
            if sf and sf not in seen_files:
                seen_files.add(sf)
                files.append(sf)
    except Exception:
        pass

    return {
        "status": "ok",
        "chunks_in_db": count,
        "vector_store_ready": True,
        "files": files,
    }


# ─────────────────────────────────────────────────────────
# /files  – list uploaded files
# ─────────────────────────────────────────────────────────
@app.get("/files")
async def list_files():
    if vector_store is None:
        raise HTTPException(status_code=503, detail="Vector store not available.")
    try:
        results = vector_store._collection.get(include=["metadatas"])
        file_stats = {}
        for meta in results.get("metadatas", []):
            sf = meta.get("source_file", "unknown")
            file_stats[sf] = file_stats.get(sf, 0) + 1
        return {
            "files": [{"name": k, "chunks": v} for k, v in file_stats.items()],
            "total_chunks": vector_store._collection.count()
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ─────────────────────────────────────────────────────────
# /files/{filename}  – delete a single file from the KB
# ─────────────────────────────────────────────────────────
@app.delete("/files/{filename:path}")
async def delete_file(filename: str):
    """Remove all chunks belonging to a specific file from ChromaDB."""
    if vector_store is None:
        raise HTTPException(status_code=503, detail="Vector store not available.")
    try:
        results = vector_store._collection.get(where={"source_file": filename})
        ids = results.get("ids", [])
        if not ids:
            raise HTTPException(status_code=404, detail=f"No chunks found for '{filename}'.")
        vector_store._collection.delete(ids=ids)
        remaining = vector_store._collection.count()
        log.info(f"Deleted {len(ids)} chunks for '{filename}'. Remaining: {remaining}")
        return {"message": f"'{filename}' removed from knowledge base.", "deleted_chunks": len(ids), "chunks_remaining": remaining}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ─────────────────────────────────────────────────────────
# /clear  – wipe the vector store (for testing/reset)
# ─────────────────────────────────────────────────────────
@app.delete("/clear")
async def clear_db():
    """Delete ALL stored chunks by dropping and recreating the ChromaDB collection."""
    global vector_store
    if vector_store is None:
        raise HTTPException(status_code=503, detail="Vector store not available.")
    try:
        collection_name = "ragravity_docs"
        client = vector_store._client

        # Drop the entire collection – most reliable wipe
        client.delete_collection(collection_name)
        log.info("Collection dropped.")

        # Recreate fresh collection backed by the same persist dir
        vector_store = Chroma(
            embedding_function=embeddings,
            persist_directory=DB_DIR,
            collection_name=collection_name,
        )

        remaining = vector_store._collection.count()
        log.info(f"Collection recreated. Remaining chunks: {remaining}")
        return {"message": "Vector store cleared.", "chunks_remaining": remaining}
    except Exception as exc:
        log.error(f"Clear error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


# ─────────────────────────────────────────────────────────
# /debug/retrieval  – see raw chunks without calling LLM
# ─────────────────────────────────────────────────────────
@app.post("/debug/retrieval")
async def debug_retrieval(req: QueryRequest):
    if vector_store is None:
        raise HTTPException(status_code=503, detail="Vector store not available.")
    docs = vector_store.similarity_search(req.query, k=5)
    return {
        "chunks_in_db": vector_store._collection.count(),
        "retrieved": len(docs),
        "results": [
            {
                "rank": i + 1,
                "source_file": doc.metadata.get("source_file", "?"),
                "page": doc.metadata.get("page", "?"),
                "preview": doc.page_content[:400],
            }
            for i, doc in enumerate(docs)
        ],
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
