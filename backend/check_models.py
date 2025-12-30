from groq import Groq
from app.core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

try:
    print("Fetching models...")
    models = client.models.list()
    # Filter for vision
    # The attributes might be 'id'
    vision_models = [m.id for m in models.data if "vision" in m.id.lower() or "llama" in m.id.lower()]
    print("Available Models:")
    for m in vision_models:
        print(f" - {m}")
except Exception as e:
    print(f"Error: {e}")
