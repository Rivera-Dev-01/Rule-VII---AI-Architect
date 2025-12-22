# System Architecture

## Overview

The Architectural Mentor AI is a full-stack application that combines RAG (Retrieval-Augmented Generation) with a fine-tuned LLM to provide expert architectural design critiques.

## Architecture Diagram

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Frontend (Next.js on Vercel)      │
│  - Chat Interface                   │
│  - Image Upload                     │
│  - Citation Display                 │
└──────┬──────────────────────────────┘
       │ HTTPS
       ▼
┌─────────────────────────────────────┐
│  Backend (FastAPI on Railway)      │
│  ┌─────────────────────────────┐   │
│  │  API Routes                 │   │
│  │  - /chat                    │   │
│  │  - /critique                │   │
│  │  - /auth                    │   │
│  └────┬────────────────────────┘   │
│       │                             │
│  ┌────▼─────────┐  ┌──────────┐   │
│  │ RAG Service  │  │ LLM Svc  │   │
│  └────┬─────────┘  └────┬─────┘   │
└───────┼─────────────────┼──────────┘
        │                 │
        ▼                 ▼
┌──────────────┐   ┌─────────────┐
│  Supabase    │   │  RunPod     │
│  - Postgres  │   │  - vLLM     │
│  - pgvector  │   │  - Llama    │
│  - Auth      │   │    3.1 8B   │
└──────────────┘   └─────────────┘
```

## Component Responsibilities

### Frontend (Next.js)
- User interface and interaction
- Real-time chat with streaming
- Image upload for floor plans
- Display code citations
- Authentication UI

### Backend (FastAPI)
- API gateway
- Request orchestration
- Business logic
- Authentication middleware

### RAG Service
- Vector similarity search
- Context retrieval from building codes
- Embedding generation
- Source tracking

### LLM Service
- Prompt construction
- Model inference via RunPod
- Response streaming
- Token management

### Database (Supabase)
- Document storage (chunked)
- Vector embeddings (pgvector)
- User authentication
- Conversation history

### AI Model (RunPod)
- Fine-tuned Llama 3.1 8B
- Hosted on vLLM
- Serverless inference
- Auto-scaling

## Data Flow

### 1. User Query Flow
```
User Input → Frontend → Backend API
  → RAG Service (retrieve context)
  → LLM Service (generate response)
  → Backend → Frontend → User
```

### 2. Document Ingestion Flow
```
PDF → LlamaParse → Markdown
  → Chunking → Embedding
  → Supabase (pgvector)
```

### 3. Training Flow
```
Dataset Creation → Google Colab
  → Unsloth Training → LoRA Adapters
  → Hugging Face → RunPod Deployment
```

## Technology Choices

### Why Next.js?
- Server-side rendering for SEO
- API routes for backend integration
- Vercel deployment (free tier)
- React ecosystem

### Why FastAPI?
- Fast async performance
- Auto-generated API docs
- Python ML ecosystem
- Easy Railway deployment

### Why Supabase?
- Postgres + pgvector in one
- Built-in authentication
- Real-time subscriptions
- Generous free tier

### Why Llama 3.1 8B?
- Good balance of quality/cost
- Fits in consumer GPU (training)
- Fast inference
- Open source

### Why RunPod?
- Serverless GPU inference
- Pay per second
- vLLM support
- Auto-scaling

## Deployment Strategy

### Local Development
- Docker Compose for all services
- Hot reload for both frontend/backend
- Local Supabase (optional)

### Production
- Frontend: Vercel (CDN, auto-deploy)
- Backend: Railway (containers, auto-deploy)
- Database: Supabase Cloud
- AI: RunPod Serverless

## Security

- API keys in environment variables
- Supabase Row Level Security (RLS)
- JWT authentication
- CORS configuration
- Rate limiting (future)

## Scalability

- Stateless backend (horizontal scaling)
- Serverless AI (auto-scaling)
- CDN for frontend
- Database connection pooling
- Caching layer (future)

## Cost Optimization

- Free tiers for development
- Serverless AI (pay per use)
- Efficient chunking (reduce storage)
- Client-side caching
- Batch processing for embeddings
