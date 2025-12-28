# 🏗️ Rule VII SaaS - AI Architectural Mentor

AI-powered architectural design critique system using Philippine building codes (NBCP Rule VII) with professional analysis, RAG-based code citations, and project management.

## 🎯 Overview

An AI mentor that analyzes architectural designs against Philippine building codes (NBCP, Fire Code, BP 344) and international standards (ADA). Provides professional critiques with specific code citations, dimensional requirements, and draft proposal generation.

## 🛠️ Tech Stack

| Layer | Technology | Hosting |
|-------|-----------|---------|
| **Frontend** | Next.js 14 (React + TypeScript) | Vercel |
| **Backend** | FastAPI (Python 3.12) | Docker / Railway |
| **Database** | Supabase (PostgreSQL + pgvector) | Supabase Cloud |
| **AI/LLM** | Groq (Llama 3.3 70B) | Groq Cloud |
| **RAG** | sentence-transformers embeddings | Supabase pgvector |
| **Auth** | Supabase Auth + JWT | Supabase |

## ✨ Key Features

- **AI Chat Interface** - Real-time design critique with streaming responses
- **RAG-Powered Citations** - Accurate code citations from building codes stored in pgvector
- **Project Management** - Create, organize, and track architectural projects
- **Draft Proposals** - AI-generated proposals that can be saved and managed
- **Chat History** - Persistent conversation history with favorites
- **Rate Limiting** - API protection with slowapi (20 requests/minute)
- **Secure Authentication** - JWT-based auth via Supabase

## 📁 Project Structure

```
Rule-VII---AI-Architect/
├── frontend/                 # Next.js 14 + TypeScript
│   ├── src/
│   │   ├── app/              # App Router (pages)
│   │   │   ├── auth/         # Auth callback
│   │   │   ├── dashboard/    # Main workspace
│   │   │   ├── login/        # Login page
│   │   │   └── signup/       # Registration
│   │   ├── components/
│   │   │   ├── chat/         # ChatInterface, MessageList
│   │   │   ├── workspace/    # DocumentPanel, DocumentSection
│   │   │   ├── layout/       # Sidebar, Header
│   │   │   ├── features/     # UploadModal, ResourceModal
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── lib/              # API client, Supabase client
│   │   └── types/            # TypeScript interfaces
│   └── Dockerfile.dev
│
├── backend/                  # FastAPI + Python 3.12
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── chat.py       # Chat endpoints with rate limiting
│   │   │   ├── projects.py   # Project CRUD
│   │   │   ├── project_files.py # File uploads
│   │   │   ├── users.py      # User management
│   │   │   ├── analyze.py    # Design analysis
│   │   │   └── auth.py       # Authentication
│   │   ├── core/
│   │   │   ├── config.py     # Settings & environment
│   │   │   └── security.py   # JWT verification
│   │   ├── models/           # Pydantic schemas
│   │   └── services/
│   │       ├── rag_engine.py # Vector similarity search
│   │       └── llm_engine.py # Groq LLM integration
│   ├── requirements.txt
│   └── Dockerfile
│
├── data-pipeline/            # RAG data ingestion (Google Colab)
├── fine-tuning/              # Model training resources
├── docker-compose.yml        # Local development stack
└── Makefile                  # Development shortcuts
```

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20+
- Docker & Docker Compose
- Supabase account (free tier)
- Groq API key (free tier)

### 1. Clone & Configure Environment

```bash
git clone <repo>
cd Rule-VII---AI-Architect

# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your keys

# Frontend environment
cp frontend/.env.local.example frontend/.env.local
# Edit frontend/.env.local with your keys
```

### 2. Required Environment Variables

**Backend (.env)**:
```env
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-service-role-key
GROQ_API_KEY=your-groq-api-key
DEBUG=true
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run with Docker

```bash
docker-compose up -d
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

### 4. Local Development (without Docker)

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

## 📊 Database Schema

The application uses Supabase with the following key tables:

| Table | Purpose |
|-------|---------|
| `users` | User profiles (synced with auth) |
| `projects` | Architectural projects |
| `project_files` | File uploads per project |
| `conversations` | Chat sessions |
| `messages` | Chat messages |
| `draft_proposals` | AI-generated proposals |
| `rag_documents` | Building code chunks with embeddings |

## 📝 API Endpoints

### Protected Routes (require JWT)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/chat` | POST | Send message & get AI response |
| `/api/v1/chat/history` | GET | Get conversation list |
| `/api/v1/chat/{id}` | GET | Get conversation messages |
| `/api/v1/chat/{id}` | DELETE | Delete conversation |
| `/api/v1/projects` | GET/POST | List/Create projects |
| `/api/v1/projects/{id}` | GET/PUT/DELETE | Project CRUD |
| `/api/v1/users/profile` | GET | Get user profile |

### Public Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/verify` | POST | Verify JWT token |
| `/health` | GET | Health check |

## 🔒 Security Features

- **Rate Limiting**: 20 requests/minute per IP on chat endpoints
- **JWT Authentication**: Supabase-issued tokens verified on backend
- **CORS Configuration**: Explicit origin allowlist
- **Row Level Security**: Enabled on all Supabase tables
- **Non-sensitive Logging**: Debug mode doesn't expose secrets

## 🔧 RAG Data Pipeline

The RAG system uses pre-ingested building code documents. Data ingestion is done via Google Colab:

1. **Documents Supported**:
   - National Building Code of the Philippines (PD 1096)
   - NBCP Revised IRR (2004)
   - Fire Code (RA 9514)
   - Accessibility Law (BP 344)
   - ADA Standards 2010

2. **Pipeline Flow**:
   ```
   PDF → Google Colab → LlamaParse → Chunking → Embedding → Supabase pgvector
   ```

3. **Metadata Fields**:
   - `document_type`: law, code, ordinance, standard
   - `law_code`: NBCP, FIRE_CODE, BP344, ADA
   - `section_ref`: Specific section references

## 💰 Cost Estimates

**Development**: Free (using free tiers)

**Production (100 users)**:
- Vercel Hosting: $0-20/month
- Supabase: $25/month (Pro)
- Groq API: Pay-per-token (~$10-30/month)
- Railway: $5-20/month

## 🤝 Contributing

This is a personal project. Feel free to fork and adapt for your needs.

## 📄 License

MIT
