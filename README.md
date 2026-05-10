<div align="center">
  <h1>🌌 RAGravity</h1>
  <p><strong>A hyper-focused Retrieval-Augmented Generation (RAG) knowledge base.</strong></p>
</div>

RAGravity is an AI-powered document intelligence platform that allows you to upload PDFs and text files, build a local vector knowledge base, and chat with your documents using advanced RAG. 

Built with speed and precision in mind, RAGravity uses ultra-fast inference (Groq) and strictly grounds its answers in your uploaded documents—completely eliminating AI hallucinations.

## ✨ Features
- **📚 Smart Document Ingestion:** Upload multiple PDFs and TXT files seamlessly. Documents are smartly chunked and embedded in a persistent local vector database.
- **🎯 Strict Grounding (Zero Hallucination):** The AI is prompted to answer *strictly* from the provided context. If the answer isn't in your documents, it won't make one up.
- **⚡ Ultra-Fast Inference:** Powered by Groq's LPU inference engine for near-instant responses.
- **📖 Source Citation:** Every answer traces back to its source file and page, so you can easily verify the information.
- **🎨 Modern User Interface:** A sleek, responsive, and distraction-free React frontend built with Tailwind CSS and Framer Motion.
- **🧠 100% Local Embeddings:** Uses HuggingFace `all-MiniLM-L6-v2` locally for privacy and cost-efficiency.

## 🛠️ Tech Stack

**Frontend:**
- **React 19** + **Vite** for blistering fast development and rendering
- **Tailwind CSS** for modern, responsive styling
- **Framer Motion** for fluid animations
- **Lucide React** for crisp, scalable icons

**Backend:**
- **FastAPI** for a high-performance Python backend API
- **LangChain** for RAG orchestration and document loaders
- **ChromaDB** for local, persistent vector storage
- **HuggingFace** (`all-MiniLM-L6-v2`) for local embedding generation
- **Groq API** (`llama-3.1-8b-instant`) for blazing fast LLM inference


   

