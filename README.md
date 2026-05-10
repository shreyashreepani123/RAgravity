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

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- A [Groq API Key](https://console.groq.com/keys)

### 1. Clone the repository
```bash
git clone https://github.com/shreyashreepani123/RAgravity.git
cd RAgravity
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up your environment variables:
   Create a `.env` file in the `backend` directory based on `.env.example`:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```
5. Run the FastAPI server:
   ```bash
   python main.py
   ```
   *The server will start on `http://localhost:8000`.*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:5173`.*

## 🎯 Usage
1. Open your browser and navigate to `http://localhost:5173`.
2. Use the **Upload** panel on the left to add your PDF or TXT files.
3. Wait a moment for the backend to chunk and embed the files into ChromaDB.
4. Type your question in the **Chat Interface** on the right.
5. Enjoy fast, accurate, and fully cited answers from your own knowledge base!

## 📄 License
This project is licensed under the MIT License.
