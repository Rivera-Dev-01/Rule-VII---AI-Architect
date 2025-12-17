# Data Directory

## Structure

```
data/
├── raw_pdfs/           # Original PDF documents
├── parsed_markdown/    # LlamaParse output
├── embeddings/         # Generated embeddings (optional local cache)
└── training/          # Fine-tuning datasets
```

## Building Code PDFs to Collect

### Philippine Codes (Priority)
1. **National Building Code of the Philippines (PD 1096)**
   - Source: DPWH or local government offices
   
2. **NBCP Revised IRR (2004 Edition)**
   - Most critical document
   - Contains Table VIII.1 (Setbacks), parking dimensions, etc.

3. **Fire Code of the Philippines (RA 9514)**
   - BFP official website

4. **Accessibility Law (BP 344)**
   - NCDA or government archives

5. **Housing Laws (BP 220 & PD 957)**
   - HLURB/DHSUD

### International Standards
6. **ADA Standards 2010**
   - Download: https://www.ada.gov/

### Manufacturer Data
7. **Product Catalogs**
   - Toto Philippines (toilets)
   - Kohler (fixtures)
   - Samsung/LG (appliances)

## Usage

1. Place PDFs in `raw_pdfs/`
2. Run parsing script: `python scripts/data_preparation/parse_pdfs.py`
3. Run embedding script: `python scripts/data_preparation/chunk_and_embed.py`
