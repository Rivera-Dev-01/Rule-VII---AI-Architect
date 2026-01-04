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

---

### ✅ Already in Dataset (Reference Only)

> These laws/IRRs are already ingested. Tables below are for reference.

#### PD 1096 IRR - National Building Code IRR ✅
<details>
<summary>Click to expand Rule reference</summary>

| Rule | Description | Key Sections |
|------|-------------|--------------|
| Rule I | General Provisions | Scope, Definitions, Admin |
| Rule II | Administration & Enforcement | Building Officials, Permits |
| Rule III | Classification & Zoning | Occupancy Types, Use Groups |
| Rule IV | Site Requirements | Setbacks, Yards, Open Spaces |
| Rule V | Environmental Requirements | Natural Light, Ventilation |
| Rule VI | Fire Zone Requirements | Fire Districts, Materials |
| Rule VII | General Building Requirements | Heights, Floor Areas, Stairs |
| Rule VIII | Light & Ventilation | Window Openings, Skylights |
| Rule IX | Sanitation | Plumbing, Drainage, Water |
| Rule X | Building Projection | Balconies, Cornices, Awnings |
| Rule XI | Fire-Resistive Requirements | Fire Ratings, Compartments |
| Rule XII | Types of Construction | Fire-resistive, Non-combustible |
| Rule XIII | Fire Protection | Extinguishers, Standpipes |
| Rule XIV | Electrical & Mechanical | Equipment Rooms, Safety |
| Rule XV | Acoustic Insulation | Sound Control |
| Rule XVI | Excavation & Construction | Safety During Construction |
| Rule XVII | Signs | Sign Types, Permits |
| Rule XVIII | Parking & Loading | Required Spaces, Dimensions |
| Rule XIX | Special Uses | Theaters, Stadiums, Hospitals |

</details>

#### RA 9514 IRR - Fire Code IRR (2019 Revised) ✅
<details>
<summary>Click to expand Chapter reference</summary>

| Chapter | Description | Key Sections |
|---------|-------------|--------------|
| 1 | General Provisions | Scope, Definitions |
| 2 | Fire Service | Organization, Duties |
| 3 | Fire Safety Inspections | Types, Schedules |
| 4 | Fire Safety Measures | Requirements by Occupancy |
| 5 | Hazardous Materials | Storage, Handling |
| 6 | Fire Protection Systems | Sprinklers, Alarms, Standpipes |
| 7 | Means of Egress | Exit Width, Travel Distance |
| 8 | Fire Drills | Frequency, Requirements |
| 9 | Fire Safety Certificate | FSEC Requirements |
| 10 | Penalties | Violations, Fines |

</details>

#### RA 9266 - Architecture Act of 2004 ✅
Already ingested.

---

### Priority 2: Core Laws to Add

> [!NOTE]
> RA 9266 (Architecture) is already ingested. Only RA 386 and RA 7160 need to be added.

#### RA 386 - Civil Code of the Philippines (Property Provisions)
| Book/Title | Description | Key Articles |
|------------|-------------|--------------|
| Book II, Title II | Ownership | Art. 427-439: Rights of Owner |
| Book II, Title VII | Easements | Art. 613-657: Servitudes |
| Book II, Title VII, Ch. 2 | Legal Easements | Art. 634-657: Light, View, Waters |

**Key Sections for Architecture:**
- Art. 637: Windows requiring consent
- Art. 670-673: Light and view easements
- Art. 674-681: Drainage and waters
- Art. 684-687: Party walls

- [ ] Extract only property/easement relevant articles
- [ ] Metadata: `law_code: "RA 386"`, `document_type: "law"`, `section_filter: "property"`

#### RA 7160 - Local Government Code of 1991 (Zoning Provisions)
| Book/Title | Description | Key Sections |
|------------|-------------|--------------|
| Book II, Title I | Local Taxing Powers | Sec. 128-162 |
| Book III, Title I | Local Ordinances | Sec. 447-449 (Zoning powers) |
| Book III, Title VI | Local Development | Sec. 465-478 |

**Key Sections for Architecture:**
- Sec. 447: Municipality powers (zoning)
- Sec. 458: City powers (zoning)
- Sec. 468: Province powers
- Sec. 20: Reclassification of agricultural lands

- [ ] Extract zoning-relevant sections only
- [ ] Metadata: `law_code: "RA 7160"`, `document_type: "law"`, `section_filter: "zoning"`

---

### Priority 3: Feature Engine Datasets

#### 3A. Feasibility & Housing Engine
*For socialized housing compliance and project viability*

| Dataset | Legal Basis | Functionality |
|---------|-------------|---------------|
| **DHSUD MCs (2023-2025)** | Gov't Issuance | Price ceilings for socialized condos (MC 2024-005) |
| **RA 7279** (Urban Dev. & Housing Act) | Republic Act | Land use rights, relocation, site selection |

- [ ] Download DHSUD MCs from official website
- [ ] Download RA 7279 from Official Gazette
- [ ] Metadata: `document_type: "memorandum"`, `agency: "DHSUD"` / `law_code: "RA 7279"`

#### 3B. Government Project Expert
*For procurement and bidding compliance*

| Dataset | Legal Basis | Functionality |
|---------|-------------|---------------|
| **RA 12009** (New Gov't Procurement Act) | Republic Act | Replaces parts of RA 9184 (Aug 2024) |
| **GPPB Resolution 02-2025** | Gov't Resolution | IRR of RA 12009 - bidding rules |
| **DPWH D.O. 131 s. 2025** | Dept. Order | Design audit checklist |

- [ ] Download RA 12009 from Official Gazette
- [ ] Download GPPB Resolution from GPPB website
- [ ] Download DPWH DO 131 from DPWH website
- [ ] Metadata: `law_code: "RA 12009"` / `document_type: "resolution"`, `agency: "GPPB"`

#### 3C. Site & Safety Analyst
*For construction safety and heritage compliance*

| Dataset | Legal Basis | Functionality |
|---------|-------------|---------------|
| **DOLE D.O. 13** | Dept. Order | Construction site logistics, barracks, clinics |
| **RA 10066 + IRR** (Heritage Act) | Republic Act | 50-year-old building protection |
| **BP 344 + IRR** (Accessibility) | Batas Pambansa | Ramps, toilet layouts, hallway widths |

- [ ] Download DOLE DO 13 from DOLE website
- [ ] Download RA 10066 + IRR from NCCA website
- [ ] Fix/re-ingest BP 344 (currently corrupted)
- [ ] Metadata: `law_code: "RA 10066"` / `law_code: "BP 344"`

#### 3D. Contract & Dispute Manager
*For contract drafting and dispute resolution*

| Dataset | Legal Basis | Functionality |
|---------|-------------|---------------|
| **RA 9285** (ADR Act of 2004) | Republic Act | Arbitration process for CIAC disputes |

> [!NOTE]
> CIAP Document 102 excluded pending copyright verification.

- [ ] Download RA 9285 from Official Gazette
- [ ] Metadata: `law_code: "RA 9285"`, `document_type: "law"`

---

### Priority 4: Reference Documents

#### DPWH Department Orders (Recent/Active)
| DO Number | Year | Subject |
|-----------|------|---------|
| DO 22 | 2015 | Revised Guidelines for Building Permits |
| DO 23 | 2016 | DPWH Construction Safety Guidelines |
| DO 33 | 2017 | Structural Design Requirements |
| DO 75 | 2019 | Green Building Rating System |
| DO 111 | 2020 | Building Inspection Guidelines |

- [ ] Compile list of active DOs from DPWH website
- [ ] Download PDFs and extract key provisions
- [ ] Metadata: `document_type: "dept_order"`, `agency: "DPWH"`

#### BFP Memorandums & Circulars
| MC Number | Year | Subject |
|-----------|------|---------|
| MC 2018-001 | 2018 | FSEC Requirements Update |
| MC 2019-003 | 2019 | Fire Safety Requirements for BPO |
| MC 2020-002 | 2020 | COVID Fire Safety Protocols |
| MC 2021-001 | 2021 | Fire Code Compliance Guidelines |

- [ ] Get active MCs from BFP website
- [ ] Focus on construction/building-related MCs
- [ ] Metadata: `document_type: "memorandum"`, `agency: "BFP"`

---

### Priority 5: Metro Manila LGU Ordinances (Major Cities Only)

> [!IMPORTANT]
> **Scope Limitation**: Only major cities with significant development activity.
> Not all 16 cities - focus on high-construction-activity areas.

#### Target Cities (12 of 16 NCR Cities)
| City | Priority | Key Ordinances |
|------|----------|---------------|
| **Makati** | 🔴 High | Zoning Ordinance, Height Limits, CBD regulations |
| **Taguig (BGC)** | 🔴 High | BGC Special Zone, Fort Bonifacio regulations |
| **Pasig** | 🔴 High | Ortigas CBD, Eastwood regulations |
| **Quezon City** | 🔴 High | Largest city, multiple CBDs (Eastwood, Vertis) |
| **Manila** | 🔴 High | Historical zones, Intramuros guidelines |
| **Parañaque** | 🟡 Medium | Entertainment City, Airport zone |
| **Pasay** | 🟡 Medium | Bay Area, MOA Complex regulations |
| **Mandaluyong** | 🟡 Medium | EDSA Greenhill, Ortigas area |
| **San Juan** | 🟡 Medium | Heritage district guidelines |
| **Muntinlupa** | 🟡 Medium | Alabang CBD, industrial zones |
| **Las Piñas** | 🟢 Low | Basic zoning ordinances |
| **Marikina** | 🟢 Low | Flood zone regulations |

#### Excluded Cities (Limited Development)
- Caloocan (North)
- Malabon
- Navotas
- Valenzuela

#### Ordinance Categories to Collect
```
1. Zoning Ordinance (Comprehensive Land Use Plan - CLUP)
2. Building Height Regulations
3. Setback Requirements (if different from PD 1096)
4. Parking Requirements (if different from national)
5. Special Economic Zone Rules (if applicable)
6. Heritage/Conservation Guidelines (if applicable)
```

#### Collection Strategy
```python
LGU_METADATA = {
    "document_type": "lgu_ordinance",
    "jurisdiction": "city_name",
    "scope": "metro_manila",
    "ordinance_type": "zoning|height|parking|heritage"
}
```

- [ ] Contact City Planning Offices for official ordinances
- [ ] Download from LGU websites (transparency portals)
- [ ] Prioritize Makati, BGC, Pasig first (highest development)
- [ ] Verify ordinance currency (check for amendments)
- [ ] Note: Some may require FOIA requests

#### Integration with Law Router
```python
# Add LGU intent detection
LOCATION_LAW_MAP = {
    "makati": ["Makati Zoning Ord.", "PD 1096", "RA 9514"],
    "bgc": ["BGC Master Plan", "Taguig Zoning", "PD 1096"],
    "ortigas": ["Pasig Zoning", "PD 1096", "RA 9514"],
    "quezon city": ["QC Zoning", "PD 1096", "RA 9514"],
}
```

---

### Dataset Ingestion Checklist

#### ✅ Already Ingested
| Source | Status |
|--------|--------|
| PD 1096 (National Building Code) | ✅ Done |
| PD 1096 Revised IRR (2004) | ✅ Done |
| RA 9514 Revised IRR (2019) | ✅ Done |
| RA 9266 (Architecture) | ✅ Done |
| BP 220 Revised IRR | ✅ Done |
| PD 957 Revised IRR | ✅ Done |
| PD 856 (Sanitation) | ✅ Done |
| RA 544 (Civil Engineering) | ✅ Done |
| RA 8495 (Mechanical) | ✅ Done |
| RA 11032 IRR | ✅ Done |
| Philippine Green Building Code | ✅ Done |
| JMC 2018-01 | ✅ Done |

#### ❌ To Add
| Source | Category | Est. Chunks | Status |
|--------|----------|-------------|--------|
| **BP 344 + IRR** (Accessibility) | Site & Safety | ~50 | ⚠️ Fix/Re-ingest |
| **RA 386** (Civil Code - property) | Core Law | ~30 | ⬜ Pending |
| **RA 7160** (LGC - zoning) | Core Law | ~40 | ⬜ Pending |
| **RA 7279** (Urban Dev. & Housing) | Feasibility | ~40 | ⬜ Pending |
| **DHSUD MCs** (2023-2025) | Feasibility | ~30 | ⬜ Pending |
| **RA 12009** (New Procurement Act) | Gov't Projects | ~50 | ⬜ Pending |
| **GPPB Resolution 02-2025** | Gov't Projects | ~30 | ⬜ Pending |
| **DPWH D.O. 131 s. 2025** | Gov't Projects | ~20 | ⬜ Pending |
| **DOLE D.O. 13** (Construction Safety) | Site & Safety | ~30 | ⬜ Pending |
| **RA 10066 + IRR** (Heritage Act) | Site & Safety | ~40 | ⬜ Pending |
| **RA 9285** (ADR Act) | Contract/Dispute | ~30 | ⬜ Pending |
| **DPWH DOs** (other active) | Reference | ~100 | ⬜ Pending |
| **BFP MCs** | Reference | ~50 | ⬜ Pending |
| **Metro Manila LGUs** | LGU Ordinances | ~300 | ⬜ Pending |

**Total New Chunks to Add:** ~840

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
