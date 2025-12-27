# Google Colab RAG Pipeline (LlamaParse Version)

Complete pipeline for processing Philippine building codes and legal documents using LlamaParse for better document parsing.

---

## Cell 1: Install Dependencies

```python
# Clean, minimal dependencies with LlamaParse
!pip install -q llama-parse langchain sentence-transformers supabase groq

print("✓ Dependencies installed")
```

---------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------

## Cell 2: Configuration

```python
# ============================================
# CONFIGURATION - Update these values
# ============================================

# LlamaParse (Get free key at: https://cloud.llamaindex.ai)
LLAMA_CLOUD_API_KEY = "llx-your-key-here"

# Supabase
SUPABASE_URL = "https://your-project.supabase.co"
SUPABASE_KEY = "your-anon-key"

# Groq (Get free key at: https://console.groq.com)
GROQ_API_KEY = "your-groq-api-key"

# Chunking settings
CHUNK_SIZE = 800       # Larger for legal docs
CHUNK_OVERLAP = 100    # More overlap for context
BATCH_SIZE = 50

print("✓ Configuration loaded")
```
---------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------
---

## Cell 3: Upload PDF Files

```python
from google.colab import files

print("📁 Click the button below to upload your PDF files...")
print("   (You can select multiple files at once)")
print()

uploaded = files.upload()

PDF_FILES = list(uploaded.keys())
print(f"\n✓ Uploaded {len(PDF_FILES)} files:")
for f in PDF_FILES:
    size_kb = len(uploaded[f]) / 1024
    print(f"  📄 {f} ({size_kb:.1f} KB)")
```

------------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------

## Cell 4: Initialize Models & Clients

```python
import re
import hashlib
import nest_asyncio
from llama_parse import LlamaParse
from sentence_transformers import SentenceTransformer
from supabase import create_client
from groq import Groq
from langchain.text_splitter import RecursiveCharacterTextSplitter

# Fix async for Colab
nest_asyncio.apply()

# LlamaParse parser
print("Initializing LlamaParse...")
parser = LlamaParse(
    api_key=LLAMA_CLOUD_API_KEY,
    result_type="markdown",  # Better for legal docs
    parsing_instruction="""This is a Philippine legal document (building code, fire code, or accessibility law). 
Please:
1. Preserve section numbers and article numbers exactly
2. Keep table structures intact
3. Maintain hierarchy (Chapter > Section > Subsection)
4. Extract all text including headers and footers"""
)
print("✓ LlamaParse ready")

# Embedding model
print("Loading embedding model...")
embed_model = SentenceTransformer('all-MiniLM-L6-v2')
print(f"✓ Embeddings ready (device: {embed_model.device})")

# Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
print("✓ Supabase connected")

# Groq
groq_client = Groq(api_key=GROQ_API_KEY)
print("✓ Groq ready")

# Legal-aware text splitter
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
    separators=[
        "\n## ",           # Markdown headers
        "\n### ",
        "\nSECTION",
        "\nSec.",
        "\nARTICLE",
        "\nRule ",
        "\n\n",
        "\n",
        ". ",
        " "
    ]
)

print("\n✅ All systems ready!")
```

---------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------

## Cell 5: Save Uploaded Files Temporarily

```python
import os

# Create temp directory
os.makedirs("/content/pdfs", exist_ok=True)

# Save uploaded files
for filename, content in uploaded.items():
    filepath = f"/content/pdfs/{filename}"
    with open(filepath, "wb") as f:
        f.write(content)
    print(f"✓ Saved: {filepath}")

print(f"\n📂 {len(PDF_FILES)} files ready for processing")
```

---------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------

## Cell 6: LlamaParse Extraction

```python
def extract_with_llamaparse(filepath, filename):
    """Extract text from PDF using LlamaParse."""
    print(f"  📄 Parsing with LlamaParse...")
    
    # Parse the document
    documents = parser.load_data(filepath)
    
    # Combine all document text
    text = "\n\n".join([doc.text for doc in documents])
    
    print(f"  ✓ Extracted {len(text):,} chars (markdown format)")
    return text
```

---------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------

## Cell 7: Legal-Aware Chunking

```python
def detect_section(text):
    """Extract section/article number from text."""
    patterns = [
        r'Section\s+(\d+[\.\d]*)',
        r'Sec\.\s*(\d+[\.\d]*)',
        r'SECTION\s+(\d+[\.\d]*)',
        r'Article\s+(\d+)',
        r'ARTICLE\s+(\d+)',
        r'Rule\s+(\w+)',
        r'##\s+(.+)',  # Markdown headers
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(0).strip()
    
    return None


def chunk_text_legal(text, source):
    """Split legal text into chunks with section context."""
    print("  ✂️ Chunking with legal structure awareness...")
    
    # Split into chunks
    chunks = text_splitter.split_text(text)
    
    documents = []
    current_section = "General Provisions"
    
    for i, chunk in enumerate(chunks):
        # Detect section in chunk
        detected = detect_section(chunk)
        if detected:
            current_section = detected
        
        # Create enhanced content with metadata
        enhanced_content = f"""[Source: {source}]
[Reference: {current_section}]

{chunk.strip()}"""
        
        # Create document
        doc_id = hashlib.md5(f"{source}_{i}_{chunk[:50]}".encode()).hexdigest()[:16]
        
        documents.append({
            "id": doc_id,
            "content": enhanced_content,
            "source": source,
            "chunk_index": i
        })
    
    print(f"  ✓ Created {len(documents)} legal-aware chunks")
    return documents
```

---------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------
---------------------------------------------------------------------------------------------

## Cell 8: Embedding & Upload

```python
def embed_chunks(documents):
    """Generate embeddings for all chunks."""
    print("  🧠 Generating embeddings...")
    
    contents = [doc["content"] for doc in documents]
    embeddings = embed_model.encode(contents, show_progress_bar=True)
    
    for doc, emb in zip(documents, embeddings):
        doc["embedding"] = emb.tolist()
    
    print(f"  ✓ Embedded {len(documents)} chunks")
    return documents


def upload_to_supabase(documents):
    """Upload chunks to Supabase in batches."""
    print("  ☁️ Uploading to Supabase...")
    
    total = len(documents)
    batches = (total + BATCH_SIZE - 1) // BATCH_SIZE
    
    for i in range(0, total, BATCH_SIZE):
        batch = documents[i:i + BATCH_SIZE]
        supabase.table("rag_documents").upsert(batch).execute()
        batch_num = (i // BATCH_SIZE) + 1
        print(f"    Batch {batch_num}/{batches}")
    
    print(f"  ✓ Uploaded {total} chunks")
```

---

## Cell 9: Main Pipeline

```python
def process_pdf(filename):
    """Process a single PDF through the complete pipeline."""
    filepath = f"/content/pdfs/{filename}"
    
    print(f"\n{'='*60}")
    print(f"📚 Processing: {filename}")
    print('='*60)
    
    try:
        # Step 1: Extract with LlamaParse
        text = extract_with_llamaparse(filepath, filename)
        
        # Step 2: Chunk with legal awareness
        documents = chunk_text_legal(text, filename)
        del text
        
        # Step 3: Generate embeddings
        documents = embed_chunks(documents)
        
        # Step 4: Upload to Supabase
        upload_to_supabase(documents)
        
        chunk_count = len(documents)
        del documents
        
        print(f"\n✅ SUCCESS: {chunk_count} chunks uploaded")
        return chunk_count
        
    except Exception as e:
        print(f"\n❌ FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        return 0


def run_pipeline():
    """Run the complete pipeline for all uploaded PDFs."""
    print("\n" + "="*60)
    print("  🚀 LEGAL RAG PIPELINE (LlamaParse)")
    print("="*60)
    
    total_chunks = 0
    
    for filename in PDF_FILES:
        chunks = process_pdf(filename)
        total_chunks += chunks
    
    print("\n" + "="*60)
    print(f"  🎉 COMPLETE! Total: {total_chunks} chunks")
    print("="*60)
    
    return total_chunks

# ============================================
# RUN THE PIPELINE
# ============================================
run_pipeline()
```

---

## Cell 10: Test RAG Queries

```python
def ask(question, top_k=5, verbose=False):
    """Query the RAG system."""
    
    query_embedding = embed_model.encode(question).tolist()
    
    results = supabase.rpc(
        "search_documents",
        {"query_embedding": query_embedding, "match_count": top_k}
    ).execute()
    
    if not results.data:
        return "No relevant information found."
    
    if verbose:
        print("📚 Sources:")
        for doc in results.data:
            sim = doc.get('similarity', 0)
            print(f"  - {doc['source']} (sim: {sim:.3f})")
        print()
    
    context = "\n\n---\n\n".join([doc['content'] for doc in results.data])
    
    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": """You are an expert on Philippine building codes.
Answer based ONLY on the provided context. Cite specific sections when possible.
If information is not in the context, say so."""},
            {"role": "user", "content": f"""Context:
{context}

Question: {question}"""}
        ],
        temperature=0.2
    )
    
    return response.choices[0].message.content


# Test
print("🧪 Testing RAG System\n")
print(ask("What are the fire exit requirements?", verbose=True))
```

---

## Get Your API Keys

1. **LlamaParse**: https://cloud.llamaindex.ai (1000 free pages/day)
2. **Groq**: https://console.groq.com (free tier)
3. **Supabase**: Your existing project

---

## Supabase Setup (Run Once)

```sql
-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table
CREATE TABLE IF NOT EXISTS rag_documents (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    source TEXT,
    chunk_index INTEGER,
    embedding VECTOR(384),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS rag_documents_embedding_idx 
ON rag_documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create search function
CREATE OR REPLACE FUNCTION search_documents(
    query_embedding VECTOR(384),
    match_count INT DEFAULT 5
)
RETURNS TABLE (id TEXT, content TEXT, source TEXT, similarity FLOAT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT rag_documents.id, rag_documents.content, rag_documents.source,
           1 - (rag_documents.embedding <=> query_embedding) AS similarity
    FROM rag_documents
    ORDER BY rag_documents.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
```

---

## Benefits of LlamaParse

| Feature | LlamaParse | EasyOCR + PyMuPDF |
|---------|------------|-------------------|
| Tables | ✅ Preserved | ❌ Broken |
| Layout | ✅ Maintained | ⚠️ Lost |
| Scanned PDFs | ✅ Built-in OCR | ⚠️ Separate setup |
| Code complexity | ✅ Simple | ❌ Complex |
| Legal docs | ✅ Excellent | ⚠️ Okay |
