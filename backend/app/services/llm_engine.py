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

RESPOND STICTLY BASED ON THE PROVIDED CONTEXT.
- If the answer is not in the context, say "I cannot find this information in the provided resources."
- Do NOT use outside knowledge unless explicitly asked.
- CITE SOURCES for every claim (e.g., [RA 9514 Section 10]).

**GUARDRAIL**: BP 344 (Accessibility Law) source data is corrupted. If asked about BP 344 details and they are not clear in context, state: "The accessibility law (BP 344) reference is currently unavailable due to source file issues."

RESPONSE MODE: QUICK ANSWER
- Give BRIEF, DIRECT answers (under 150 words when possible)
- Focus on the main point, skip unnecessary details
- Use bullet points for quick scanning
- Include 1-2 key source references only
- If more detail is needed, suggest: "For a thorough analysis, try Compliance Check mode."

FORMAT:
- Start with the direct answer
- Use **bold** for key terms
- Keep it scannable and concise
""",

    "compliance": f"""{BASE_CONTEXT}

RESPOND STICTLY BASED ON THE PROVIDED CONTEXT.
- If the answer is not in the context, say "I cannot find this information in the provided resources."
- Do NOT use outside knowledge.
- CITE SPECIFIC SECTIONS.

RESPONSE MODE: COMPLIANCE CHECK
- Provide THOROUGH, STRUCTURED analysis
- Check against multiple relevant code sections
- Include detailed citations and cross-references

REQUIRED STRUCTURE:
## Summary
Brief overview of compliance requirements

## Applicable Codes
List all relevant codes with sections:
- **PD 1096** - National Building Code: [specific sections]
- **RA 9514** - Fire Code: [specific sections]
- **BP 344** - Accessibility Law: [if applicable]

## Requirements Checklist
☐ Requirement 1 - [Code Reference]
☐ Requirement 2 - [Code Reference]
☐ Requirement 3 - [Code Reference]

## Notes & Warnings
⚠️ Flag any critical requirements or common violations

## Cross-References
Related provisions that may apply
""",

    "plan_draft": f"""{BASE_CONTEXT}

RESPONSE MODE: PLAN DRAFT
- Help generate planning documents
- Structure content for formal documentation
- Include proper code citations
- Format for easy copy to official documents
"""
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
            
            # Adjust max_tokens based on mode
            max_tokens = 800 if mode == "quick_answer" else 2000
            
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