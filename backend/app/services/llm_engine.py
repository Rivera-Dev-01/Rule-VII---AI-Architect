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


# Base system prompt components
BASE_CONTEXT = """You are an AI Architectural Mentor for Philippine building codes.
You provide guidance on building codes, fire safety, accessibility, and construction requirements in the Philippines."""

# Mode-specific system prompts
MODE_PROMPTS = {
    "quick_answer": f"""{BASE_CONTEXT}

RESPONSE MODE: QUICK ANSWER
You provide BRIEF, DIRECT answers to legal/code questions.

RULES:
1. Answer in under 200 words when possible
2. Use bullet points for quick scanning  
3. CITE sources using exact references from context: [Law Code - Section]
4. If not in context: "I cannot find this in the provided references."
5. For complex questions, suggest: "For detailed analysis, try Compliance Check mode."

FORMAT:
- Start with the direct answer
- **Bold** key terms and numbers
- 2-3 source citations
""",

    "compliance": f"""{BASE_CONTEXT}

RESPONSE MODE: COMPLIANCE CHECK
You provide STRUCTURED compliance analysis with summary and narrative explanation.

RULES:
1. ONLY use information from the KNOWLEDGE BASE CONTEXT provided
2. If specific requirements are NOT in context, say "Not found in available references"
3. NEVER make up numbers, dimensions, or requirements
4. Every requirement MUST cite [Law Code - Section] using exact references from context

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
""",

    "plan_draft": f"""{BASE_CONTEXT}

RESPONSE MODE: PLAN DRAFT
- Help generate planning documents
- Structure content for formal documentation
- Include proper code citations from provided context only
- Format for easy copy to official documents
"""
}

# Max tokens configuration per mode
MODE_MAX_TOKENS = {
    "quick_answer": 800,
    "compliance": 1500,      # Reduced from 2000
    "plan_draft": 1200,
    "deep_thinking": 2500,   # Future: comprehensive
}

# Legacy default prompt (fallback)
SYSTEM_PROMPT = MODE_PROMPTS["quick_answer"]



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
        project_context: str = "",
        mode: str = "quick_answer"
    ) -> Dict[str, Any]:
        """
        Generate AI response with RAG context.
        
        Args:
            prompt: User's message
            sources: Retrieved source documents (for citation)
            project_context: Additional project-specific context
            mode: Chat mode (quick_answer, plan_draft, compliance)
            
        Returns:
            Dict with 'text' and optional 'proposal'
        """
        try:
            # 1. Get mode-specific configuration
            mode_config = RAGEngine.get_mode_config(mode)
            temperature = mode_config.get("temperature", 0.3)
            system_prompt = MODE_PROMPTS.get(mode, MODE_PROMPTS["quick_answer"])
            
            # Get max_tokens from config
            max_tokens = MODE_MAX_TOKENS.get(mode, 800)
            
            # 2. Get RAG context from Supabase
            rag_context = await self.rag_engine.get_context(prompt, user_id="", mode=mode)
            
            # 3. Build the full context
            full_context = ""
            if rag_context:
                full_context += f"KNOWLEDGE BASE CONTEXT:\n{rag_context}\n\n"
            if project_context:
                full_context += f"PROJECT CONTEXT:\n{project_context}\n\n"
            
            # 4. Create the user message with context
            user_message = f"{full_context}USER QUESTION: {prompt}"
            
            # 5. Call Groq API with mode-specific settings
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=temperature,
                max_tokens=max_tokens
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