from pydantic import BaseModel
from typing import Optional

class SourceNode(BaseModel):
    document: str           # Source filename (e.g., "RA 9514 Revised IRR.pdf")
    page: int               # Chunk index
    section: str            # Section reference extracted from content
    similarity: float       # Similarity score
    content: str = ""       # Actual chunk content for display
    law_code: str = ""      # Law code (e.g., "RA_9514", "PD_1096")
