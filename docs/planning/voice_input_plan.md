# Voice Input Feature - Implementation Plan

## Overview
Add voice-to-text input for the chat interface, allowing users to speak their questions instead of typing.

## Stack
| Component | Technology |
|-----------|------------|
| **STT** | Groq Whisper (`whisper-large-v3-turbo`) |
| **Recording** | Browser MediaRecorder API |
| **VAD** | Silero VAD (WebAssembly) |
| **TTS (optional)** | Browser SpeechSynthesis (free) |

---

## Files to Create/Modify

### Backend
```
app/
├── api/v1/voice.py         [NEW] - Whisper transcription endpoint
└── services/voice.py       [NEW] - Audio processing + guardrails
```

### Frontend
```
components/chat/
├── VoiceInput.tsx          [NEW] - Mic button + recording logic
├── VoiceInput.module.css   [NEW] - Styles
└── ChatInput.tsx           [MODIFY] - Add mic button
```

---

## Anti-Hallucination Guardrails

### Layer 1: Frontend (Before Sending)

| Guardrail | Implementation | Catches |
|-----------|----------------|---------|
| **Minimum duration** | Reject < 0.5 seconds | Accidental clicks |
| **Maximum duration** | Limit to 60 seconds | Rambling/forgotten recordings |
| **Volume threshold** | Ignore audio < 30dB | Background hum, fan noise |
| **Silero VAD** | Detect human speech | No voice = cancel recording |
| **Auto-stop on silence** | Stop after 2s silence | Forgot to stop recording |

### Layer 2: Backend (Before Whisper)

| Guardrail | Implementation | Catches |
|-----------|----------------|---------|
| **Trim silence** | Remove leading/trailing silence | Dead air |
| **Audio normalization** | Normalize volume levels | Quiet recordings |
| **Sample rate check** | Ensure 16kHz or higher | Bad audio quality |

### Layer 3: Whisper Configuration

| Setting | Value | Why |
|---------|-------|-----|
| `language` | Auto or `"en"` | Better accuracy when specified |
| `temperature` | `0` | Reduce randomness/hallucination |
| `no_speech_threshold` | `0.6` | Higher = stricter silence detection |
| `compression_ratio_threshold` | `2.4` | Detect repetitive hallucinations |
| `condition_on_previous_text` | `False` | Prevent compounding errors |

### Layer 4: Post-Transcription Validation

| Check | Action |
|-------|--------|
| **Empty result** | Show "Couldn't catch that, try again" |
| **Too short (<3 chars)** | Reject |
| **Known hallucinations** | Filter out (see list below) |
| **Mostly punctuation** | Reject |
| **Repetitive text** | Reject (e.g., "the the the the") |

### Known Hallucination Phrases to Filter
```python
HALLUCINATION_PATTERNS = [
    # YouTube spam
    "thank you for watching",
    "subscribe to my channel",
    "like and subscribe",
    "please subscribe",
    "thanks for watching",
    "see you next time",
    "don't forget to subscribe",
    
    # Silence artifacts
    "...",
    "♪",
    "[Music]",
    "[Applause]",
    "[Laughter]",
    "(silence)",
    "(inaudible)",
    "(unintelligible)",
    
    # Generic filler
    "bye bye",
    "bye-bye",
    "okay bye",
    "um",
    "uh",
]
```

---

### Layer 5: Domain Keyword Validation (Key Anti-Hallucination)

**Logic:** If the transcription doesn't contain at least one domain-relevant keyword, it's likely garbage or off-topic hallucination.

**Why this works:** Filipino users asking about architecture laws will ALWAYS use at least one of these terms (even in Taglish).

```python
DOMAIN_KEYWORDS = {
    # Law references
    "ra", "pd", "bp", "irr", "nbcp", "nbc",
    "9514", "1096", "344", "220", "957", "856",
    "fire code", "building code", "accessibility",
    "rule vii", "rule 7", "section",
    
    # Architecture terms
    "setback", "egress", "exit", "stairway", "corridor",
    "floor area", "occupancy", "ventilation", "ceiling",
    "height", "width", "meter", "meters", "square",
    "firewall", "sprinkler", "alarm", "extinguisher",
    "ramp", "handrail", "guardrail", "landing",
    "basement", "mezzanine", "penthouse", "rooftop",
    "door", "window", "wall", "floor", "storey", "story",
    
    # Building types
    "residential", "commercial", "industrial", "institutional",
    "high-rise", "low-rise", "mixed-use", "subdivision",
    "barangay", "building", "structure", "house", "condo",
    
    # Common question patterns (English + Filipino)
    "what", "how", "where", "when", "which",
    "ano", "paano", "saan", "kailan", "alin",
    "magkano", "ilan",
    "requirement", "require", "required",
    "allowed", "allow", "pwede", "puede", "puwede",
    "need", "kailangan", "dapat",
    "minimum", "maximum", "limit",
    
    # Compliance terms
    "compliant", "compliance", "violation", "permit",
    "approval", "inspection", "certificate", "clearance",
    "legal", "illegal", "penalty", "fine",
    
    # Project-related
    "project", "design", "plan", "drawing", "blueprint",
    "architect", "engineer", "contractor",
}

def has_domain_keyword(text: str) -> bool:
    """Check if transcription contains at least one domain keyword."""
    text_lower = text.lower()
    return any(keyword in text_lower for keyword in DOMAIN_KEYWORDS)
```

| Example Input | Keyword Found | Result |
|---------------|---------------|--------|
| *"What are fire exit requirements?"* | ✅ fire, exit, requirements | **Accept** |
| *"Ano yung setback sa residential?"* | ✅ setback, residential | **Accept** |
| *"Paano mag-apply ng permit?"* | ✅ paano, permit | **Accept** |
| *"Thank you for watching"* | ❌ None | **Reject** |
| *"Subscribe to my channel"* | ❌ None | **Reject** |

---

## User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         VOICE INPUT FLOW                        │
└─────────────────────────────────────────────────────────────────┘

User taps 🎤 mic button
        │
        ▼
┌─────────────────┐
│ Start Recording │ ◄─── Visual feedback (pulsing mic icon)
└────────┬────────┘
        │
        ▼
┌─────────────────┐
│ VAD: Is voice   │───No──► Cancel, show "No voice detected"
│ detected?       │    
└────────┬────────┘
        │ Yes
        ▼
┌─────────────────┐
│ User speaking   │ ◄─── Volume indicator bar
│ ...             │
└────────┬────────┘
        │
        ▼
┌─────────────────┐
│ 2s silence OR   │
│ user taps stop  │
└────────┬────────┘
        │
        ▼
┌─────────────────┐
│ Check duration  │───< 0.5s──► Cancel, show "Too short"
│ >= 0.5s?        │
└────────┬────────┘
        │ Yes
        ▼
┌─────────────────┐
│ Send to backend │ ◄─── Show loading spinner
└────────┬────────┘
        │
        ▼
┌─────────────────────────────────────────────┐
│ Backend:                                     │
│  1. Trim silence                            │
│  2. Send to Groq Whisper                    │
│  3. Validate transcription                  │
│  4. Return text OR error                    │
└────────┬────────────────────────────────────┘
        │
        ▼
┌─────────────────┐
│ Valid result?   │───No──► Show "Couldn't catch that, try again"
└────────┬────────┘
        │ Yes
        ▼
┌─────────────────┐
│ Auto-send to    │ ◄─── Seamless, no user confirmation needed
│ chat API        │
└────────┬────────┘
        │
        ▼
┌─────────────────┐
│ AI responds     │
└─────────────────┘
```

---

## API Endpoint

### POST `/api/v1/voice/transcribe`

**Request:**
```
Content-Type: multipart/form-data
Body: audio file (webm/mp3/wav)
```

**Response:**
```json
{
    "success": true,
    "text": "What are the fire exit requirements for a 10-storey building?",
    "language": "en",
    "duration": 3.5
}
```

**Error Response:**
```json
{
    "success": false,
    "error": "no_speech",
    "message": "No speech detected in audio"
}
```

---

## UI Design

### Mic Button States
| State | Visual |
|-------|--------|
| Idle | 🎤 Gray mic icon |
| Recording | 🔴 Pulsing red mic with wave animation |
| Processing | ⏳ Spinner |
| Error | 🎤 Shake animation + toast message |

### Position
- Next to the send button in ChatInput
- Same size as send button
- Tooltip: "Voice input"

---

## Dependencies

### Backend
```
# requirements.txt additions
pydub>=0.25.0        # Audio processing
librosa>=0.10.0      # Audio analysis (optional, for advanced features)
```

### Frontend
```
# npm packages
@ricky0123/vad-web   # Silero VAD for browser
```

---

## Estimated Effort
| Phase | Time |
|-------|------|
| Backend endpoint + guardrails | 2-3 hours |
| Frontend recording + UI | 3-4 hours |
| VAD integration | 1-2 hours |
| Testing & polish | 2-3 hours |
| **Total** | **8-12 hours** |

---

## Status
🟡 **STANDBY** - Awaiting user approval to proceed
