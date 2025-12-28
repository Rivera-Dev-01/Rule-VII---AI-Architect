"""
LLM Engine Service
Handles AI response generation using Groq.
"""

import logging
from typing import List, Optional, Dict, Any
from groq import Groq
from app.models.citation import SourceNode
from app.core.config import settings
from app.services.rag_engine import RAGEngine

logger = logging.getLogger(__name__)


# System prompt for the AI architect
SYSTEM_PROMPT = """You are an AI Architectural Mentor for Philippine building codes.

YOUR ROLE:
You provide comprehensive, helpful guidance on building codes, fire safety, accessibility, and construction requirements in the Philippines.

RESPONSE GUIDELINES:
1. Be COMPREHENSIVE - provide thorough answers that fully address the user's question
2. Use MARKDOWN formatting to make responses clear and scannable:
   - Use **bold** for important terms and code references
   - Use bullet points (- ) for lists of requirements
   - Use numbered lists (1. 2. 3.) for step-by-step processes
   - Use headers (## or ###) to organize longer responses
   - Use markdown tables when comparing multiple items or codes
3. CITE SOURCES - include [Source: LAW_CODE Section X.X] for each referenced code
4. If user asks for a TABLE, provide it in markdown format:
   | Header1 | Header2 | Header3 |
   |---------|---------|---------|
   | Data    | Data    | Data    |
5. NO SPECULATION - if not in your knowledge base, say so clearly

EXAMPLE TABLE FORMAT:
| Code | Authority | Purpose |
|------|-----------|---------|
| PD 1096 | DPWH | National Building Code |
| RA 9514 | BFP | Fire Code |

EXAMPLE RESPONSE:
## Fire Safety Requirements for Small Buildings

For small apartments or condos, you must comply with:

**1. Fire Code of the Philippines (RA 9514)**
- Fire detection and alarm systems per **Section 10.2.6.6**
- Automatic sprinkler systems per **Section 10.2.6.7**

**2. National Building Code (PD 1096)**
- Means of egress requirements per **Rule VII**
- Fire-resistive construction per **Section 701**

[Source: RA 9514 Revised IRR (2019), PD 1096]
"""


class LLMEngine:
    """
    LLM service using Groq for fast inference.
    Integrates with RAGEngine for context-aware responses.
    """
    
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.client = Groq(api_key=self.api_key)
        self.rag_engine = RAGEngine()
        self.model = "llama-3.3-70b-versatile"  # Updated (3.1 deprecated)
        
        if settings.DEBUG:
            logger.info(f"LLM Engine initialized with model: {self.model}")
    
    async def generate(
        self, 
        prompt: str, 
        sources: List[SourceNode],
        project_context: str = ""
    ) -> Dict[str, Any]:
        """
        Generate AI response with RAG context.
        
        Args:
            prompt: User's message
            sources: Retrieved source documents (for citation)
            project_context: Additional project-specific context
            
        Returns:
            Dict with 'text' and optional 'proposal'
        """
        try:
            # 1. Get RAG context from Supabase
            rag_context = await self.rag_engine.get_context(prompt, user_id="", top_k=5)
            
            # 2. Build the full context
            full_context = ""
            if rag_context:
                full_context += f"KNOWLEDGE BASE CONTEXT:\n{rag_context}\n\n"
            if project_context:
                full_context += f"PROJECT CONTEXT:\n{project_context}\n\n"
            
            # 3. Create the user message with context
            user_message = f"{full_context}USER QUESTION: {prompt}"
            
            # 4. Call Groq API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.3,  # Lower for more factual responses
                max_tokens=1500
            )
            
            ai_text = response.choices[0].message.content
            
            # 5. Detect if response should include a proposal
            proposal = self._extract_proposal(prompt, ai_text)
            
            if settings.DEBUG:
                logger.debug(f"Generated response: {len(ai_text)} chars, proposal: {proposal is not None}")
            
            return {
                "text": ai_text,
                "proposal": proposal
            }
            
        except Exception as e:
            logger.error(f"LLM generation failed: {e}")
            return {
                "text": f"I encountered an error processing your request. Please try again.",
                "proposal": None
            }
    
    def _extract_proposal(self, prompt: str, response: str) -> Optional[Dict[str, Any]]:
        """
        Detect if the response should include a formal proposal.
        Used for compliance checks, analysis requests, etc.
        """
        # Keywords that trigger proposal generation
        proposal_triggers = [
            "analyze", "check", "review", "compliance", 
            "verify", "assess", "evaluate", "audit"
        ]
        
        should_propose = any(
            keyword in prompt.lower() 
            for keyword in proposal_triggers
        )
        
        if not should_propose:
            return None
        
        # Generate a structured proposal from the response
        return {
            "id": f"prop_{hash(response) % 10000:04d}",
            "title": self._generate_proposal_title(prompt),
            "reasoning": "Based on NBCP Rule VII and applicable fire safety codes.",
            "summary": response[:200] + "..." if len(response) > 200 else response,
            "proposed_content": response
        }
    
    def _generate_proposal_title(self, prompt: str) -> str:
        """Generate a title for the proposal based on the prompt."""
        prompt_lower = prompt.lower()
        
        if "fire" in prompt_lower:
            return "Fire Safety Compliance Review"
        elif "exit" in prompt_lower or "egress" in prompt_lower:
            return "Means of Egress Analysis"
        elif "setback" in prompt_lower:
            return "Setback Requirements Review"
        elif "accessibility" in prompt_lower or "ramp" in prompt_lower:
            return "Accessibility Compliance Check"
        else:
            return "Building Code Compliance Analysis"
    
    async def quick_answer(self, question: str) -> str:
        """
        Simple question-answer without proposal.
        Useful for quick queries.
        """
        result = await self.generate(question, [], "")
        return result["text"]