# Deployment Guide

## Prerequisites

- GitHub account
- Vercel account
- Railway account
- Supabase account
- RunPod account
- Hugging Face account

## Step 1: Database Setup (Supabase)

1. Create new project at https://supabase.com
2. Go to SQL Editor
3. Run the schema from `database/supabase_schema.sql`
4. Enable pgvector extension
5. Copy your project URL and keys

## Step 2: Backend Deployment (Railway)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Add environment variables in Railway dashboard:
SUPABASE_URL=your-url
SUPABASE_KEY=your-key
RUNPOD_API_KEY=your-key
HUGGINGFACE_TOKEN=your-token
LLAMAPARSE_API_KEY=your-key

# Deploy
railway up
```

## Step 3: Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Add environment variables in Vercel dashboard:
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Step 4: AI Model Deployment (RunPod)

1. Train model in Google Colab (see `scripts/training/colab_setup.md`)
2. Upload LoRA adapters to Hugging Face
3. Create RunPod Serverless endpoint:
   - Template: vLLM
   - Model: your-username/llama-3.1-8b-arch-mentor
   - GPU: A40 or better
4. Copy API endpoint and key

## Step 5: Data Ingestion

```bash
# On your local machine
python scripts/data_preparation/parse_pdfs.py
python scripts/data_preparation/chunk_and_embed.py
```

## Verification

1. Frontend: https://your-app.vercel.app
2. Backend: https://your-backend.railway.app/docs
3. Database: Check Supabase table editor
4. AI: Test RunPod endpoint

## Monitoring

- Vercel: Analytics dashboard
- Railway: Logs and metrics
- Supabase: Database usage
- RunPod: GPU usage and costs

## Troubleshooting

### Backend won't start
- Check Railway logs
- Verify environment variables
- Check requirements.txt dependencies

### Frontend can't connect
- Verify NEXT_PUBLIC_API_URL
- Check CORS settings in backend
- Verify Supabase keys

### AI responses failing
- Check RunPod endpoint status
- Verify API key
- Check model deployment logs
