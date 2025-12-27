# RAG Pipeline Design: Rule-VII AI Architect

A high-level design document for building a Retrieval-Augmented Generation system using a **streaming pipeline** approach.

---

## Design Philosophy

### Cloud-Only, No Local Storage
- All processing happens in **Google Colab** (temporary)
- Final data stored in **Supabase** (permanent)
- Nothing saved on local PC or Google Drive

### Streaming Pipeline
- Process **one PDF at a time** through the full pipeline
- Each PDF: Download → Extract → Chunk → Embed → Upload → Clear
- Low memory, fault-tolerant, no storage needed

---

## Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Runtime | Google Colab | Free GPU, temporary processing |
| Scraping | requests | Download PDFs to memory |
| Extraction | PyMuPDF | Extract text from PDF bytes |
| Chunking | LangChain | Split text into pieces |
| Embeddings | sentence-transformers | Text → vectors (free, local) |
| Database | Supabase pgvector | Store chunks + embeddings |
| LLM | Groq API | Fast inference (free tier) |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STREAMING DATA PIPELINE                             │
│                     (Runs in Google Colab - Nothing Saved)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   FOR EACH PDF:                                                             │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────────┐  │
│   │DOWNLOAD │ → │ EXTRACT │ → │  CHUNK  │ → │  EMBED  │ → │   UPLOAD    │  │
│   │(memory) │   │(memory) │   │(memory) │   │(memory) │   │ (Supabase)  │  │
│   └─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────────┘  │
│        ↓                                                         ↓          │
│   Clear memory after each PDF ←──────────────────────────────────┘          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE (Permanent Storage)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│   rag_documents table:                                                      │
│   • id, content, source, chunk_index, embedding, created_at                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              RAG QUERY                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│   User Query → Embed → Vector Search → Context + Groq LLM → Response       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Sources

| Dataset | Relevance | Search Term |
|---------|-----------|-------------|
| NBCP Revised IRR (2004) | Rule VII & VIII tables, setbacks, TOSL, AMBF | `PD 1096 Revised IRR 2004 PDF` |
| RA 9514 Fire Code (2019 RIRR) | Exits, stairs, corridor widths | `BFP RIRR 2019 PDF` |
| Batas Pambansa 344 | Accessibility, ramps, PWD toilets | `BP 344 IRR Amendments PDF` |

---

## Stage 1: Download PDF (To Memory)

### Purpose
Fetch PDF directly into memory — no file saved to disk.

### Approach
- Use `requests.get()` with `content` attribute (bytes)
- Add 5-second delay between downloads
- Add User-Agent header for government sites

### Key Points
- PDF stays in memory as `bytes`
- No `.pdf` file saved anywhere
- Clear variable after processing

### Dependencies
```
requests
```

---

## Stage 2: Extract Text (From Memory)

### Purpose
Extract text from PDF bytes without saving to disk.

### Approach
- Use PyMuPDF with `fitz.open(stream=pdf_bytes, filetype="pdf")`
- Extract text page by page
- Keep in memory as string

### Key Points
- Works directly with bytes (no file needed)
- Preserves page information for metadata
- Output: plain text string

### Dependencies
```
pymupdf
```

---

## Stage 3: Chunk Text (In Memory)

### Purpose
Split text into smaller overlapping pieces.

### Chunking Parameters
| Parameter | Value | Reason |
|-----------|-------|--------|
| Chunk Size | 500 chars | Good for retrieval precision |
| Overlap | 50 chars | Prevents sentence cuts |
| Separators | `\n\n`, `\n`, `. ` | Respects structure |

### Metadata Per Chunk
- `id`: Unique hash
- `content`: The text chunk
- `source`: Original PDF name
- `chunk_index`: Position in document

### Dependencies
```
langchain
```

---

## Stage 4: Generate Embeddings (In Memory)

### Purpose
Convert each chunk to a 384-dimensional vector.

### Model
**`all-MiniLM-L6-v2`**
- Free, runs on Colab GPU
- 384 dimensions
- Fast and accurate

### Process
- Load model once at start
- Embed each chunk as it's created
- Keep embedding attached to chunk

### Dependencies
```
sentence-transformers
torch
```

---

## Stage 5: Upload to Supabase (Stream)

### Purpose
Send chunks + embeddings directly to database.

### Database Table: `rag_documents`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Unique chunk hash |
| content | TEXT | Chunk text |
| source | TEXT | PDF filename |
| chunk_index | INTEGER | Position in document |
| embedding | VECTOR(384) | Embedding vector |
| created_at | TIMESTAMPTZ | Timestamp |

### Upload Strategy
- Upsert in batches of 50 chunks
- Use chunk hash as ID (deduplication)
- Clear memory after successful upload

### Dependencies
```
supabase
```

---

## Stage 6: RAG Query with Groq

### Purpose
Search database and generate answers.

### Query Flow
1. User asks question
2. Embed question → vector
3. Vector search in Supabase (RPC function)
4. Get top 5 matching chunks
5. Build context from chunks
6. Send to Groq LLM
7. Return answer

### Groq Models
| Model | Speed | Use Case |
|-------|-------|----------|
| `llama-3.1-8b-instant` | Fastest | Quick queries |
| `llama-3.1-70b-versatile` | Fast | Complex questions |

### Dependencies
```
groq
```

---

## Processing Flow Example

```
PDF List:
├── 1. NBCP Revised IRR 2004
├── 2. RA 9514 Fire Code 2019
└── 3. BP 344 Accessibility

Processing:

[PDF 1] NBCP Revised IRR 2004
├── Downloading... ✓
├── Extracting text... (87 pages) ✓
├── Chunking... (156 chunks) ✓
├── Embedding... ✓
├── Uploading to Supabase... ✓
└── Memory cleared ✓

⏳ Waiting 5 seconds...

[PDF 2] RA 9514 Fire Code 2019
├── Downloading... ✓
├── Extracting text... (124 pages) ✓
├── Chunking... (210 chunks) ✓
├── Embedding... ✓
├── Uploading to Supabase... ✓
└── Memory cleared ✓

⏳ Waiting 5 seconds...

[PDF 3] BP 344 Accessibility
├── Downloading... ✓
├── Extracting text... (45 pages) ✓
├── Chunking... (78 chunks) ✓
├── Embedding... ✓
├── Uploading to Supabase... ✓
└── Memory cleared ✓

✅ COMPLETE: 444 chunks in database
```

---

## Supabase Setup Required

### 1. Enable Vector Extension
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2. Create Table
```sql
CREATE TABLE rag_documents (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    source TEXT,
    chunk_index INTEGER,
    embedding VECTOR(384),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. Create Search Index
```sql
CREATE INDEX rag_documents_embedding_idx 
ON rag_documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### 4. Create Search Function
```sql
CREATE FUNCTION search_documents(
    query_embedding VECTOR(384),
    match_count INT DEFAULT 5
)
RETURNS TABLE (id TEXT, content TEXT, source TEXT, similarity FLOAT)
AS $$
    SELECT id, content, source,
           1 - (embedding <=> query_embedding) AS similarity
    FROM rag_documents
    ORDER BY embedding <=> query_embedding
    LIMIT match_count;
$$ LANGUAGE sql;
```

---

## Environment Variables

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
GROQ_API_KEY=your-groq-api-key
```

---

## All Dependencies

```
# Core
requests
pymupdf
langchain
sentence-transformers
torch
supabase
groq
```

---

## Benefits of This Approach

| Benefit | Description |
|---------|-------------|
| **No Storage Needed** | PDFs never saved, only chunks in DB |
| **Low Memory** | One PDF at a time, cleared after |
| **Fault Tolerant** | If PDF 3 fails, PDF 1 & 2 already in DB |
| **Deduplication** | Hash-based IDs prevent duplicates |
| **Re-runnable** | Can re-run safely (upsert) |

---

## Implementation Checklist

- [ ] Set up Supabase pgvector (table + function)
- [ ] Get Groq API key
- [ ] Find direct PDF URLs for all 3 documents
- [ ] Create Colab notebook with streaming pipeline
- [ ] Test with 1 PDF first
- [ ] Process all 3 PDFs
- [ ] Test RAG queries
