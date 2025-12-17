# 🏗️ Rule VII SaaS - AI Architectural Mentor

AI-powered architectural design critique system using Philippine building codes (NBCP Rule VII) with professional analysis and code citations.

## 🎯 Overview

An AI mentor that analyzes architectural designs against Philippine building codes (NBCP, Fire Code, BP 344) and international standards (ADA). Provides professional critiques with specific code citations and dimensional requirements.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (React) - Hosted on Vercel
- **Backend**: FastAPI (Python) - Hosted on Railway/Render
- **Database**: Supabase (Postgres + pgvector)
- **AI Training**: Unsloth + Llama 3.1 8B - Google Colab
- **AI Hosting**: vLLM on RunPod Serverless
- **Document Parsing**: LlamaParse

## 📁 Project Structure

```
rule-vii-saas/
├── frontend/              # Next.js 14 + Tailwind
│   ├── src/
│   │   ├── app/          # App Router (pages)
│   │   ├── components/   # React components
│   │   ├── lib/          # API & Supabase clients
│   │   └── types/        # TypeScript interfaces
│   └── public/           # Static assets
├── backend/              # FastAPI + Python
│   ├── app/
│   │   ├── api/v1/      # API routes
│   │   ├── core/        # Config & security
│   │   ├── models/      # Pydantic schemas
│   │   └── services/    # Business logic
│   └── Dockerfile
├── data-pipeline/        # Local PC scripts
│   ├── raw_docs/        # PDFs (gitignored)
│   ├── processed/       # Markdown output
│   └── ingest.py        # LlamaParse → Supabase
├── fine-tuning/         # Colab notebooks
│   ├── datasets/        # Training data
│   └── notebooks/       # Jupyter notebooks
└── docker-compose.yml
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker & Docker Compose
- Supabase account
- RunPod account
- LlamaParse API key

### 1. Clone & Setup
```bash
git clone <repo>
cd rule-vii-saas

# Setup backend
cd backend
cp .env.example .env
# Edit .env with your API keys

# Setup frontend
cd ../frontend
cp .env.local.example .env.local
# Edit .env.local with your keys

# Setup data pipeline
cd ../data-pipeline
cp .env.example .env
# Edit .env with LlamaParse key
```

### 2. Run with Docker
```bash
docker-compose up -d
```

Frontend: http://localhost:3000
Backend: http://localhost:8000

### 3. Setup Database
```bash
# Run schema in Supabase SQL Editor
cat database/supabase_schema.sql
```

## 📊 Data Pipeline

### Phase 1: Document Preparation
```bash
# 1. Place PDFs in data-pipeline/raw_docs/
# 2. Run ingestion pipeline
cd data-pipeline
pip install -r requirements.txt
python ingest.py
```

### Phase 2: Model Training
```bash
# 1. Prepare training data
cd fine-tuning/datasets
# Edit raw_dialogues.json with your examples

# 2. Open Google Colab
# 3. Upload fine-tuning/notebooks/train_llama3.ipynb
# 4. Upload formatted_train.jsonl
# 5. Train and export to Hugging Face
```

### Phase 3: Deploy
```bash
# Backend to Railway
railway up

# Frontend to Vercel
vercel deploy
```

## 🎓 Training Data

### RAG Documents (Facts)
- National Building Code of the Philippines (PD 1096)
- NBCP Revised IRR (2004)
- Fire Code (RA 9514)
- Accessibility Law (BP 344)
- ADA Standards 2010
- Local Zoning Ordinances

### Fine-Tune Data (Personality)
- 500+ critique dialogues
- Code citation examples
- Professional architectural tone

## 💰 Cost Estimates

**Development**: $0 (Free tiers)
**Production (100 users)**: ~$100/month
- Hosting: $20/mo
- Database: $25/mo
- AI Compute: $30-50/mo

## 🔑 Key Features

- Real-time design critique with streaming responses
- Code citations with page references
- Multi-document RAG retrieval
- Image upload for floor plan analysis (coming soon)
- User authentication via Supabase
- Conversation history

## 📝 API Endpoints

```
POST /api/auth/signup          # Register user
POST /api/auth/login           # Login
POST /api/chat/message         # Send message
POST /api/critique/analyze     # Analyze design
POST /api/critique/analyze-image  # Upload floor plan
GET  /api/documents/codes      # List building codes
```

## 🧪 Development

```bash
# Backend only
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend only
cd frontend
npm install
npm run dev
```

## 📚 Documentation

- Building Codes: Place in `data-pipeline/raw_docs/`
- API Docs: http://localhost:8000/docs
- Training Guide: `fine-tuning/notebooks/train_llama3.ipynb`

## 🤝 Contributing

This is a personal project. Feel free to fork and adapt for your needs.

## 📄 License

MIT
