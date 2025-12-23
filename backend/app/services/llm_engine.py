from typing import List
from app.models.citation import SourceNode
from app.core.config import settings


class LLMEngine:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.client = None

    async def generate(self, prompt: str, context: List[SourceNode]):
        should_propose = any(keyword in prompt.lower() for keyword in 
                            ["analyze", "check", "review", "compliance", "verify"])
        
        if should_propose:
            return {
                "text": (
                    f"I've analyzed your request: '{prompt[:50]}...'\n\n"
                    "Based on NBCP Rule VII Section 704.1, I've identified some compliance items. "
                    "Please review the proposal below for specific recommendations."
                ),
                "proposal": {
                    "id": "prop_001",
                    "title": "Building Code Compliance Check",
                    "reasoning": "Section 704.1 requires specific dimensional compliance for this building type.",
                    "summary": "Adjust building parameters to meet NBCP Rule VII requirements.",
                    "proposed_content": "**Recommendation:** Review setback distances and building height limits."
                }
            }
        else:
            return {
                "text": (
                    "I'm your AI Architectural Mentor specializing in Philippine Building Code (NBCP Rule VII). "
                    "I can help you with:\n"
                    "- Building code compliance analysis\n"
                    "- Setback and height requirements\n"
                    "- Occupancy load calculations\n"
                    "- Fire safety requirements\n\n"
                    "Upload a floor plan or ask me to analyze specific aspects of your design."
                ),
                "proposal": None
            }