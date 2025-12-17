# Project Structure

```
arch-mentor/
│
├── backend/                          # FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI app entry point
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes/
│   │   │       ├── __init__.py
│   │   │       ├── auth.py           # Authentication endpoints
│   │   │       ├── chat.py           # Chat endpoints
│   │   │       ├── critique.py       # Design critique endpoints
│   │   │       └── documents.py      # Document search endpoints
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── config.py             # App configuration
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── auth_service.py       # Auth logic
│   │       ├── critique_service.py   # Critique logic
│   │       ├── llm_service.py        # LLM inference
│   │       └── rag_service.py        # RAG retrieval
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                         # Next.js Frontend
│   ├── app/
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home page
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── ChatInterface.tsx         # Chat UI
│   │   └── Sidebar.tsx               # Navigation
│   ├── Dockerfile.dev
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   └── next.config.js
│
├── scripts/                          # Utility Scripts
│   ├── data_preparation/
│   │   ├── parse_pdfs.py             # PDF → Markdown
│   │   └── chunk_and_embed.py        # Chunk → Embeddings
│   ├── training/
│   │   ├── prepare_dataset.py        # Create training data
│   │   ├── colab_setup.md            # Colab instructions
│   │   └── example_dataset.jsonl     # Sample training data
│   └── README.md
│
├── database/
│   └── supabase_schema.sql           # Database schema
│
├── data/                             # Data Storage
│   ├── raw_pdfs/                     # Original PDFs
│   ├── parsed_markdown/              # Parsed documents
│   └── training/                     # Training datasets
│
├── models/                           # Model Storage
│   ├── checkpoints/                  # Training checkpoints
│   └── adapters/                     # LoRA adapters
│
├── docker-compose.yml                # Docker orchestration
├── .env.example                      # Environment template
├── .gitignore
├── Makefile                          # Quick commands
├── README.md                         # Main documentation
├── ARCHITECTURE.md                   # System design
├── ROADMAP.md                        # Development plan
└── DEPLOYMENT.md                     # Deployment guide
```

## Directory Purposes

### `/backend`
FastAPI application handling API requests, RAG retrieval, and LLM inference.

### `/frontend`
Next.js application providing the user interface and chat experience.

### `/scripts`
Python scripts for data preparation, training, and utilities.

### `/database`
SQL schemas and database-related files.

### `/data`
Storage for PDFs, parsed documents, and training data (gitignored).

### `/models`
Storage for trained models and adapters (gitignored).

## Key Files

- `docker-compose.yml` - Run entire stack locally
- `.env.example` - Template for environment variables
- `requirements.txt` - Python dependencies
- `package.json` - Node.js dependencies
- `supabase_schema.sql` - Database setup
