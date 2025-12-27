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
SYSTEM_PROMPT = """You are an expert AI Architectural Mentor specializing in Philippine building codes and regulations.

Your expertise includes:
- National Building Code of the Philippines (NBCP/PD 1096)
- Rule VII (Fire Safety Requirements)
- RA 9514 (Fire Code of the Philippines)
- BP 344 (Accessibility Law)
- Setback requirements, TOSL, AMBF calculations

Guidelines for your responses:
1. Answer based ONLY on the provided context from the knowledge base
2. Always cite specific sections, rules, or articles when available
3. If information is not in the context, clearly state that
4. Provide practical, actionable advice
5. When analyzing projects, check for compliance issues
6. Format responses clearly with bullet points or numbered lists when appropriate

If asked to analyze a project, identify:
- Compliance issues with specific code references
- Recommended corrections
- Priority level (Critical/Warning/Info)
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
        self.model = "llama-3.1-8b-instant"  # Fast and good quality
        
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