# Text RAG & Deep Thinking - Implementation Plan

## Overview
Improvements to reduce hallucination in Text RAG and add Deep Thinking capabilities for paid tier.

---

## Part 1: Text RAG Anti-Hallucination

### Frontend Improvements

#### 1. Law Router (Intent-Based Filtering)
Route queries to specific law codes based on detected intent:

```python
INTENT_LAW_MAP = {
    # Fire-related → Fire Code
    "fire": ["RA 9514", "PD 1096 Rule VII"],
    "exit": ["RA 9514", "PD 1096 Rule VII"],
    "sprinkler": ["RA 9514"],
    "alarm": ["RA 9514"],
    
    # Building dimensions → Building Code
    "setback": ["PD 1096"],
    "height": ["PD 1096"],
    "floor area": ["PD 1096"],
    
    # Accessibility → BP 344
    "ramp": ["BP 344"],
    "wheelchair": ["BP 344"],
    "accessibility": ["BP 344"],
    
    # Housing → BP 220, PD 957
    "subdivision": ["PD 957", "BP 220"],
}
```

- [ ] Implement intent detection from query
- [ ] Pass detected law_codes to search filter
- [ ] Update search logic to use filters

---

### Supabase Improvements

#### 2. User Document Isolation (BYOD)
```sql
-- Add user_id column
ALTER TABLE rag_documents ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- NULL = public law, UUID = private user document
-- Update RLS policy
CREATE POLICY "Users see public + own docs"
ON rag_documents FOR SELECT
USING (user_id IS NULL OR user_id = auth.uid());
```

- [ ] Add `user_id` column to `rag_documents`
- [ ] Update search RPC to filter by user_id
- [ ] Add RLS policies for isolation

---

### Backend Improvements

#### 3. Retrieval Confidence Threshold
```python
# Reject low-confidence retrievals
if best_similarity < 0.5:
    return {
        "type": "low_confidence",
        "message": "I couldn't find specific legal references. Please mention a law code."
    }
```

- [ ] Add similarity threshold check
- [ ] Return graceful "no match" response

#### 4. Citation Verification
```python
def verify_citations(response, retrieved_docs):
    """Check if cited sources exist in retrieved docs"""
    cited_refs = extract_citations(response)
    for ref in cited_refs:
        if not found_in_docs(ref, retrieved_docs):
            flag_as_hallucination(ref)
```

- [ ] Extract citations from LLM response
- [ ] Verify against retrieved chunks
- [ ] Flag/filter unverified citations

#### 5. Stricter System Prompt
```python
STRICT_PROMPT = """
CRITICAL RULES:
1. ONLY answer using the KNOWLEDGE BASE CONTEXT provided
2. If answer is NOT in context: "I cannot find this in the provided legal references."
3. NEVER use outside knowledge
4. Every claim MUST have a citation [Law Code - Section]
"""
```

- [ ] Update `MODE_PROMPTS` in `llm_engine.py`
- [ ] Add explicit grounding instructions

#### 6. Pass User ID to Search
- [ ] Update `rag_engine.py` to pass `user_id` in search
- [ ] Enable user document filtering

---

## Part 2: Deep Thinking Mode (Paid)

### Features

#### 1. Multi-Law Cross-Reference
Query multiple law codes simultaneously:
```
"What are ALL requirements for a 15-storey mixed-use building?"
→ Checks: RA 9514 + PD 1096 + BP 344 + Zoning
→ Synthesizes into unified response
```

#### 2. Chain-of-Thought Reasoning
Show step-by-step analysis:
```
Step 1: Checking Fire Code (RA 9514)...
Step 2: Cross-referencing Building Code (PD 1096)...
Step 3: Verifying Accessibility (BP 344)...
Conclusion: ...
```

#### 3. Compliance Checklist Generation
Generate structured checklist:
```
## Fire Safety Requirements (RA 9514)
☐ Fire exit width: min 1.12m - Section 10.2.5
☐ Exit signage: illuminated - Section 10.3.1
☐ Sprinkler system: required - Section 10.4.2

## Building Code (PD 1096)
☐ Setback: 4.5m front - Rule III
☐ Maximum height: 45m - Rule VII
```

#### 4. Conflict Detection
Identify contradictions between codes:
```
⚠️ Note: RA 9514 requires X, but PD 1096 Rule VII specifies Y.
Resolution: [explanation]
```

---

## Part 3: BYOD (Bring Your Own Documents)

### User Upload Flow
```
User uploads PDF → Extract text → Embed → Store with user_id → Only that user can search
```

### Privacy Guardrails
- [ ] Documents tagged with `user_id` (never NULL for uploads)
- [ ] RLS ensures isolation
- [ ] Auto-delete option (after X days)
- [ ] Terms: "User responsible for copyright compliance"
- [ ] Mark in responses: `[Private Document]` vs `[RA 9514]`

### Limits
| Tier | Upload Limit |
|------|--------------|
| Free | None |
| Paid | 10 documents, 50MB total |

---

## Part 4: Dataset Expansion

### Priority 1: Fix Existing
- [ ] BP 344 (Accessibility) - currently corrupted

### Priority 2: Add IRRs
- [ ] PD 1096 IRR (National Building Code details)
- [ ] RA 9514 IRR (Fire Code details)

### Priority 3: Core Laws
- [ ] RA 9266 (Architecture Act)
- [ ] RA 386 (Civil Code - property/easement)
- [ ] RA 7160 (Local Government Code - zoning)

### Priority 4: Reference Documents
- [ ] DPWH Department Orders
- [ ] BFP Memorandums

---

## Implementation Order

| Phase | Items | Priority |
|-------|-------|----------|
| 1 | Stricter prompt + confidence threshold | 🔴 Quick wins |
| 2 | Law Router + intent filtering | 🔴 High impact |
| 3 | Citation verification | 🟡 Medium |
| 4 | User ID isolation (BYOD prep) | 🟡 Medium |
| 5 | Deep Thinking features | 🟢 After above stable |
| 6 | Dataset expansion | 🟢 Ongoing |

---

## Status
🟡 **PLANNING** - Awaiting review
