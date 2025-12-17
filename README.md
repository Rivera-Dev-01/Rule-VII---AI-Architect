# 🏗️ Architectural Mentor AI

AI-powered architectural design critique system using professional building codes, dimensions, and expert tone.

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
arch-mentor/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/routes/     # API endpoints
│   │   ├── core/           # Config & settings
│   │   └── services/       # Business logic
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/               # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # React components
│   ├── Dockerfile.dev
│   └── package.json
├── scripts/
│   ├── data_preparation/  # PDF parsing & embedding
│   └── training/          # Model fine-tuning
├── database/              # Supabase schema
├── data/
│   ├── raw_pdfs/         # Original building codes
│   ├── parsed_markdown/  # LlamaParse output
│   └── training/         # Fine-tuning dataset
├── docker-compose.yml
└── .env.example
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
cd arch-mentor
cp .env.example .env
# Edit .env with your API keys
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
# 1. Place PDFs in data/raw_pdfs/
# 2. Parse PDFs to markdown
python scripts/data_preparation/parse_pdfs.py

# 3. Chunk and embed documents
python scripts/data_preparation/chunk_and_embed.py
```

### Phase 2: Model Training
```bash
# 1. Create training dataset
python scripts/training/prepare_dataset.py

# 2. Open Google Colab
# 3. Follow scripts/training/colab_setup.md
# 4. Upload dataset and train
# 5. Export to Hugging Face
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

- Building Codes: See `data/raw_pdfs/`
- API Docs: http://localhost:8000/docs
- Training Guide: `scripts/training/colab_setup.md`

## 🤝 Contributing

This is a personal project. Feel free to fork and adapt for your needs.

## 📄 License

MIT
