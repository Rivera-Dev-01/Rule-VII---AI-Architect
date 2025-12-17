# Scripts Directory

## Data Preparation

### parse_pdfs.py
Converts building code PDFs to markdown using LlamaParse.

```bash
python scripts/data_preparation/parse_pdfs.py
```

### chunk_and_embed.py
Chunks markdown documents and generates embeddings for Supabase.

```bash
python scripts/data_preparation/chunk_and_embed.py
```

## Training

### prepare_dataset.py
Creates fine-tuning dataset in JSONL format.

```bash
python scripts/training/prepare_dataset.py
```

### colab_setup.md
Instructions for training on Google Colab with Unsloth.

## Workflow

1. **Data Prep**: parse_pdfs.py → chunk_and_embed.py
2. **Training**: prepare_dataset.py → Google Colab
3. **Deploy**: Export model → RunPod
