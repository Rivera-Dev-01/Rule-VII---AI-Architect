# Text RAG Revision - Quick Answer & Compliance Check

## Overview
Revise the RAG system for Quick Answer and Compliance Check modes before tackling Deep Thinking.

---

## Current State

### Quick Answer
| Setting | Current | Keep? |
|---------|---------|-------|
| `top_k` | 3 | ✅ Good |
| `temperature` | 0.3 | ✅ Good |
| `max_tokens` | 800 | ✅ Good |
| Output | Brief, bulleted | ✅ Works well |

**Verdict:** Quick Answer is working well. Minor prompt tweaks only.

### Compliance Check
| Setting | Current | Change To |
|---------|---------|-----------|
| `top_k` | 8 | 6 (reduce noise) |
| `temperature` | 0.5 | 0.4 (more focused) |
| `max_tokens` | 2000 | 1500 (summary + narrative, not exhaustive) |
| Output | 5-section structure | Summary + Narrative |

**Verdict:** Needs significant prompt revision.

---

## Revised Prompts

### Quick Answer Prompt (Minor Update)

```python
"quick_answer": f"""{BASE_CONTEXT}

RESPONSE MODE: QUICK ANSWER
You provide BRIEF, DIRECT answers to legal/code questions.

RULES:
1. Answer in under 150 words when possible
2. Use bullet points for quick scanning  
3. CITE sources: [Law Code - Section]
4. If not in context: "I cannot find this in the provided references."
5. For complex questions, suggest: "For detailed analysis, try Compliance Check mode."

FORMAT:
- Start with the direct answer
- **Bold** key terms and numbers
- 1-2 source citations only

⚠️ BP 344 (Accessibility Law) source data is currently limited. If asked about BP 344 details not in context, state this limitation.
"""

BP 344 is good working with embedding so we can use it for quick answer and compliance check. 
```

### Compliance Check Prompt (Major Revision)

```python
"compliance": f"""{BASE_CONTEXT}

RESPONSE MODE: COMPLIANCE CHECK
You provide STRUCTURED compliance analysis with summary and narrative explanation.

RULES:
1. ONLY use information from the KNOWLEDGE BASE CONTEXT provided
2. If specific requirements are NOT in context, say "Not found in available references"
3. NEVER make up numbers, dimensions, or requirements
4. Every requirement MUST cite [Law Code - Section]

OUTPUT STRUCTURE:

## Verdict
State clearly: ✅ COMPLIANT | ❌ NON-COMPLIANT | ⚠️ NEEDS MORE INFO

## Summary
2-3 sentences explaining the compliance situation.

## Applicable Requirements
List the key requirements that apply:
- **Requirement 1** — [Citation]
- **Requirement 2** — [Citation]
- **Requirement 3** — [Citation]

## Analysis
Narrative explanation (3-5 paragraphs):
- Why the design is/isn't compliant
- What the user needs to change (if non-compliant)
- Any related considerations

## References
List all codes/sections cited.

---

⚠️ GUARDRAIL: If the user hasn't provided specific dimensions or design details, ask them to provide more information before giving a verdict.

⚠️ BP 344 (Accessibility Law) source data is currently limited. State this if asked about BP 344.
"""
```

---

## RAG Engine Changes

### File: `backend/app/services/rag_engine.py`

```python
MODE_CONFIG = {
    "quick_answer": {
        "top_k": 3,               # Keep same
        "doc_types": None,        # Search all
        "temperature": 0.3,       # Keep same
        "similarity_threshold": 0.35,  # Slightly stricter
    },
    "compliance": {
        "top_k": 6,               # Reduced from 8 (less noise)
        "doc_types": None,        # Search all core laws
        "temperature": 0.4,       # Reduced from 0.5 (more focused)
        "similarity_threshold": 0.4,   # Stricter (quality over quantity)
    },
    "deep_thinking": {
        "top_k": 10,              # More docs for comprehensive analysis
        "doc_types": None,        # Will include expanded dataset later
        "temperature": 0.5,       # Allow reasoning
        "similarity_threshold": 0.35,
    }
}
```

### File: `backend/app/services/llm_engine.py`

```python
# Adjust max_tokens based on mode
MODE_MAX_TOKENS = {
    "quick_answer": 800,
    "compliance": 1500,      # Reduced from 2000
    "deep_thinking": 2500,   # Future: comprehensive
}

max_tokens = MODE_MAX_TOKENS.get(mode, 800)
```

---

## Implementation Checklist

### Phase 1: Prompt Revision (30 mins)
- [x] Update `MODE_PROMPTS["quick_answer"]` in `llm_engine.py`
- [x] Update `MODE_PROMPTS["compliance"]` in `llm_engine.py`
- [x] Add `MODE_MAX_TOKENS` dict for cleaner config

### Phase 2: RAG Config Update (15 mins)
- [x] Update `MODE_CONFIG` in `rag_engine.py`
- [x] Add `similarity_threshold` to mode configs
- [x] Pass threshold to search function

### Phase 3: Testing (30 mins)
- [ ] Test Quick Answer with common questions
- [ ] Test Compliance Check with dimension-specific questions
- [ ] Verify citations are accurate
- [ ] Check that "not found" responses trigger appropriately

---

## Test Queries

### Quick Answer Tests
| Query | Expected Behavior |
|-------|-------------------|
| "What is the minimum corridor width?" | Direct answer + 1 citation |
| "Fire exit requirements?" | Bulleted list, brief |
| "What does BP 344 say about ramps?" | Should mention limited BP 344 data |

### Compliance Check Tests
| Query | Expected Behavior |
|-------|-------------------|
| "Is a 1.0m corridor compliant for office?" | ❌ NON-COMPLIANT + narrative why |
| "Check if 1.5m stair width meets fire code" | ✅ COMPLIANT + citation |
| "Is my building compliant?" (no details) | ⚠️ NEEDS MORE INFO + ask for details |

---

## Status
🟢 **READY FOR IMPLEMENTATION**
