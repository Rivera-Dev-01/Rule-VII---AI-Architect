# Project Structure

```
rule-vii-saas/
├── .gitignore                # 🔒 Critical security rules
├── README.md                 # Project documentation
├── ARCHITECTURE.md           # System diagram notes
├── Makefile                  # Shortcuts (e.g., 'make dev' starts both servers)
├── docker-compose.yml        # (Optional) For running local Postgres if offline
│
├── 📁 frontend/              # THE INTERFACE (Next.js 14 + Tailwind)
│   ├── public/
│   │   ├── logo.svg
│   │   └── hero-image.png
│   ├── src/
│   │   ├── app/              # App Router
│   │   │   ├── globals.css   # Tailwind directives
│   │   │   ├── layout.tsx    # Main layout (Sidebar + Content)
│   │   │   ├── page.tsx      # Landing Page
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── dashboard/    # The Main App
│   │   │       └── page.tsx  # Chat Window
│   │   │
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   ├── ChatInterface.tsx
│   │   │   │   ├── MessageBubble.tsx # Stylized: User vs Senior Architect
│   │   │   │   └── InputArea.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Header.tsx
│   │   │   └── features/
│   │   │       ├── CitationBox.tsx   # Shows "Source: NBCP Rule 7"
│   │   │       └── PlanUploader.tsx  # Drag & drop for floor plans
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts        # Axios instance calling FastAPI
│   │   │   └── supabase.ts   # Frontend Auth client
│   │   │
│   │   └── types/            # TypeScript Interfaces
│   │       └── index.ts      # export interface ChatMessage...
│   │
│   ├── .env.local            # 🔒 Frontend Keys (Public Supabase Key)
│   ├── next.config.js
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── 📁 backend/               # THE BRAIN (FastAPI + Python)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # Entry point (uvicorn app:app)
│   │   │
│   │   ├── api/              # Routes
│   │   │   └── v1/
│   │   │       ├── chat.py       # POST /chat (RAG Logic)
│   │   │       ├── analyze.py    # POST /analyze (Vision Logic)
│   │   │       └── auth.py       # Webhooks for Supabase
│   │   │
│   │   ├── core/             # Config
│   │   │   ├── config.py     # Loads .env variables
│   │   │   └── security.py   # API Key validation
│   │   │
│   │   ├── models/           # Pydantic Schemas
│   │   │   ├── chat.py       # class ChatRequest(BaseModel)
│   │   │   └── citation.py   # class SourceNode(BaseModel)
│   │   │
│   │   └── services/         # Heavy Logic
│   │       ├── llm_engine.py # Connects to Groq / RunPod
│   │       ├── rag_engine.py # LlamaIndex (Retrieval)
│   │       └── vision.py     # Llama 3.2 Vision handler
│   │
│   ├── .env                  # 🔒 Backend Keys (Groq, HuggingFace, Supabase Service Role)
│   ├── requirements.txt      # pip install -r requirements.txt
│   └── Dockerfile            # Instructions for Railway/Render
│
├── 📁 data-pipeline/         # THE LIBRARY (Local PC Scripts)
│   ├── raw_docs/             # 🔒 Place your PDFs here (Ignored by Git)
│   │   ├── nbcp_irr_2004.pdf
│   │   └── fire_code_ra9514.pdf
│   ├── processed/            # Intermediate Markdown files (for debugging)
│   ├── ingest.py             # Script: LlamaParse -> Vectors -> Supabase
│   ├── requirements.txt      # Specific libs (llama-parse, python-dotenv)
│   └── .env                  # 🔒 LlamaCloud API Key
│
└── 📁 fine-tuning/           # THE TRAINING GROUND (Colab Notebooks)
    ├── datasets/
    │   ├── raw_dialogues.json   # Your collected "Senior/Junior" chats
    │   └── formatted_train.jsonl # Ready for Unsloth
    └── notebooks/
        └── train_llama3.ipynb    # Download this from Colab to save it
```

## Directory Purposes

### `/frontend`
Next.js 14 application with App Router, Tailwind CSS, and TypeScript. Provides the chat interface and user experience.

### `/backend`
FastAPI application handling RAG retrieval, LLM inference, and vision analysis. Connects to Groq/RunPod for AI and Supabase for data.

### `/data-pipeline`
Local scripts for processing building code PDFs using LlamaParse and ingesting them into Supabase vector database.

### `/fine-tuning`
Training datasets and Colab notebooks for fine-tuning Llama 3.1 8B with Unsloth.

## Key Files

- `Makefile` - Quick commands for development
- `docker-compose.yml` - Run full stack locally
- `.env` files - API keys and configuration (gitignored)
- `ingest.py` - Main data pipeline script
- `train_llama3.ipynb` - Training notebook for Colab
