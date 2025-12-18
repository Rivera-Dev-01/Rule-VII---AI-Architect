from app.core.config import settings

class LLMEngine:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
    
    async def generate(self, prompt: str, context: str) -> str:
        # Your LLM generation logic here
        pass
