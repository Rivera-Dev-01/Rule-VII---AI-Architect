# ==========================================
# RAG Documents Data Quality Audit Script
# ==========================================
# Run this in Google Colab to audit your rag_documents table
#
# Instructions:
# 1. Copy this entire script to a Colab cell
# 2. Set your SUPABASE_URL and SUPABASE_KEY in the config section
# 3. Run the cell to get a full quality report
# ==========================================

# --- INSTALL DEPENDENCIES (Colab) ---
# !pip install supabase pandas -q

import re
from collections import defaultdict
from datetime import datetime

# --- CONFIGURATION ---
# Replace with your actual Supabase credentials
SUPABASE_URL = "YOUR_SUPABASE_URL"  # e.g., "https://xxxx.supabase.co"
SUPABASE_KEY = "YOUR_SUPABASE_SERVICE_KEY"  # Use service_role key for full access

# --- CONNECT TO SUPABASE ---
from supabase import create_client

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# ==========================================
# DATA QUALITY CHECKS
# ==========================================

class RAGDataAuditor:
    """Audits rag_documents table for data quality issues."""
    
    # Valid document types (from your search_documents_filtered.sql)
    VALID_DOC_TYPES = {"statutory", "procedural", "heuristics", "specialized_planning"}
    
    # Expected law_code patterns
    LAW_CODE_PATTERN = re.compile(r"^(RA|PD|BP|IRR|NBCP|Rule)\s?[\dIVX]+", re.IGNORECASE)
    
    # OCR artifact patterns
    OCR_ISSUES = [
        (r'\s{3,}', 'Multiple consecutive spaces'),
        (r'\n{3,}', 'Multiple consecutive newlines'),
        (r'[•·■□]', 'Bullet character artifacts'),
        (r'[âãäåæç]', 'Possible mojibake characters'),
        (r'\x00', 'Null byte characters'),
        (r'[\ufffd\ufffe\uffff]', 'Unicode replacement characters'),
    ]
    
    def __init__(self):
        self.records = []
        self.issues = defaultdict(list)
        self.stats = {}
    
    def fetch_all_records(self):
        """Fetch all records from rag_documents table."""
        print("📥 Fetching records from rag_documents...")
        
        # Supabase has a default limit of 1000, so we paginate
        all_records = []
        offset = 0
        batch_size = 1000
        
        while True:
            response = supabase.table("rag_documents") \
                .select("id, content, source, document_type, law_code, section_ref, chunk_index") \
                .range(offset, offset + batch_size - 1) \
                .execute()
            
            batch = response.data
            if not batch:
                break
            
            all_records.extend(batch)
            offset += batch_size
            print(f"   Fetched {len(all_records)} records...")
        
        self.records = all_records
        self.stats['total_records'] = len(all_records)
        print(f"✅ Total records fetched: {len(all_records)}\n")
        return self
    
    def check_missing_metadata(self):
        """Check for missing required fields."""
        print("🔍 Checking for missing metadata...")
        
        missing_law_code = []
        missing_section_ref = []
        missing_doc_type = []
        missing_content = []
        
        for record in self.records:
            rid = record['id']
            
            if not record.get('law_code') or record['law_code'].strip() == '':
                missing_law_code.append(rid)
            
            if not record.get('section_ref') or record['section_ref'].strip() == '':
                missing_section_ref.append(rid)
            
            if not record.get('document_type') or record['document_type'].strip() == '':
                missing_doc_type.append(rid)
            
            if not record.get('content') or record['content'].strip() == '':
                missing_content.append(rid)
        
        if missing_law_code:
            self.issues['missing_law_code'] = missing_law_code
        if missing_section_ref:
            self.issues['missing_section_ref'] = missing_section_ref
        if missing_doc_type:
            self.issues['missing_document_type'] = missing_doc_type
        if missing_content:
            self.issues['missing_content'] = missing_content
        
        print(f"   Missing law_code: {len(missing_law_code)}")
        print(f"   Missing section_ref: {len(missing_section_ref)}")
        print(f"   Missing document_type: {len(missing_doc_type)}")
        print(f"   Missing content: {len(missing_content)}\n")
        return self
    
    def check_invalid_document_types(self):
        """Check for non-standard document_type values."""
        print("🔍 Checking document_type values...")
        
        invalid_types = []
        type_distribution = defaultdict(int)
        
        for record in self.records:
            doc_type = record.get('document_type', '')
            type_distribution[doc_type or '(empty)'] += 1
            
            if doc_type and doc_type.lower() not in self.VALID_DOC_TYPES:
                invalid_types.append({
                    'id': record['id'],
                    'document_type': doc_type,
                    'source': record.get('source', '')
                })
        
        if invalid_types:
            self.issues['invalid_document_type'] = invalid_types
        
        self.stats['document_type_distribution'] = dict(type_distribution)
        
        print(f"   Invalid document_types: {len(invalid_types)}")
        print(f"   Distribution: {dict(type_distribution)}\n")
        return self
    
    def check_law_code_format(self):
        """Check law_code follows expected format."""
        print("🔍 Checking law_code format...")
        
        non_standard = []
        code_distribution = defaultdict(int)
        
        for record in self.records:
            law_code = record.get('law_code', '')
            if law_code:
                code_distribution[law_code] += 1
                
                if not self.LAW_CODE_PATTERN.match(law_code):
                    non_standard.append({
                        'id': record['id'],
                        'law_code': law_code,
                        'source': record.get('source', '')
                    })
        
        if non_standard:
            self.issues['non_standard_law_code'] = non_standard
        
        self.stats['law_code_distribution'] = dict(code_distribution)
        
        print(f"   Non-standard format: {len(non_standard)}")
        print(f"   Unique law_codes: {len(code_distribution)}\n")
        return self
    
    def check_content_quality(self):
        """Check content for quality issues."""
        print("🔍 Checking content quality...")
        
        too_short = []  # < 50 chars
        too_long = []   # > 10000 chars (likely bad chunking)
        ocr_issues = []
        
        for record in self.records:
            content = record.get('content', '')
            rid = record['id']
            content_len = len(content)
            
            # Length checks
            if content_len < 50:
                too_short.append({
                    'id': rid,
                    'length': content_len,
                    'preview': content[:100],
                    'source': record.get('source', '')
                })
            elif content_len > 10000:
                too_long.append({
                    'id': rid,
                    'length': content_len,
                    'source': record.get('source', '')
                })
            
            # OCR artifact checks
            for pattern, issue_name in self.OCR_ISSUES:
                if re.search(pattern, content):
                    ocr_issues.append({
                        'id': rid,
                        'issue': issue_name,
                        'source': record.get('source', ''),
                        'preview': content[:200]
                    })
                    break  # Only report first issue per record
        
        if too_short:
            self.issues['content_too_short'] = too_short
        if too_long:
            self.issues['content_too_long'] = too_long
        if ocr_issues:
            self.issues['ocr_artifacts'] = ocr_issues
        
        print(f"   Content too short (<50 chars): {len(too_short)}")
        print(f"   Content too long (>10k chars): {len(too_long)}")
        print(f"   OCR artifacts detected: {len(ocr_issues)}\n")
        return self
    
    def check_duplicates(self):
        """Check for duplicate content."""
        print("🔍 Checking for duplicates...")
        
        content_hash = defaultdict(list)
        for record in self.records:
            # Use first 500 chars as "fingerprint" (full content comparison is expensive)
            fingerprint = record.get('content', '')[:500].strip()
            content_hash[fingerprint].append(record['id'])
        
        duplicates = {k: v for k, v in content_hash.items() if len(v) > 1}
        
        if duplicates:
            self.issues['duplicate_content'] = [
                {'duplicate_ids': ids, 'preview': fp[:100]} 
                for fp, ids in duplicates.items()
            ]
        
        print(f"   Duplicate clusters found: {len(duplicates)}\n")
        return self
    
    def generate_report(self):
        """Generate final summary report."""
        print("\n" + "=" * 60)
        print("📊 RAG DOCUMENTS DATA QUALITY REPORT")
        print("=" * 60)
        print(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"Total Records: {self.stats['total_records']}")
        print("-" * 60)
        
        # Summary
        if not self.issues:
            print("\n✅ ALL CHECKS PASSED - No issues found!")
        else:
            print("\n⚠️  ISSUES FOUND:\n")
            for issue_type, records in self.issues.items():
                count = len(records)
                print(f"   • {issue_type}: {count} records")
        
        # Distribution stats
        print("\n📈 DISTRIBUTIONS:\n")
        if 'document_type_distribution' in self.stats:
            print("   Document Types:")
            for dtype, count in sorted(self.stats['document_type_distribution'].items()):
                print(f"      - {dtype}: {count}")
        
        if 'law_code_distribution' in self.stats:
            print(f"\n   Law Codes ({len(self.stats['law_code_distribution'])} unique):")
            for code, count in sorted(self.stats['law_code_distribution'].items(), key=lambda x: -x[1])[:10]:
                print(f"      - {code}: {count}")
            if len(self.stats['law_code_distribution']) > 10:
                print("      - ... (showing top 10)")
        
        print("\n" + "=" * 60)
        return self
    
    def export_issues_csv(self, filename="rag_issues_report.csv"):
        """Export all issues to CSV for download."""
        import pandas as pd
        
        if not self.issues:
            print("✅ No issues to export!")
            return
        
        # Flatten all issues into rows
        rows = []
        for issue_type, records in self.issues.items():
            for record in records:
                if isinstance(record, dict):
                    row = {'issue_type': issue_type, **record}
                else:
                    row = {'issue_type': issue_type, 'id': record}
                rows.append(row)
        
        df = pd.DataFrame(rows)
        df.to_csv(filename, index=False)
        print(f"\n📄 Exported {len(rows)} issues to: {filename}")
        
        # For Colab: trigger download
        try:
            from google.colab import files
            files.download(filename)
        except ImportError:
            pass  # Not in Colab
        
        return df
    
    def run_full_audit(self):
        """Run all checks and generate report."""
        return (
            self.fetch_all_records()
                .check_missing_metadata()
                .check_invalid_document_types()
                .check_law_code_format()
                .check_content_quality()
                .check_duplicates()
                .generate_report()
        )


# ==========================================
# RUN THE AUDIT
# ==========================================

if __name__ == "__main__":
    auditor = RAGDataAuditor()
    auditor.run_full_audit()
    
    # Export issues to CSV (auto-downloads in Colab)
    auditor.export_issues_csv()
    
    # Optional: View specific issue details
    # print(auditor.issues['missing_law_code'][:5])  # First 5 records with missing law_code
