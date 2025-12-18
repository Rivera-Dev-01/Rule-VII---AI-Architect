from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    
    # AI Services
    GROQ_API_KEY: str
    HUGGINGFACE_TOKEN: str
    RUNPOD_API_KEY: str
    
    # App Config
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Rule VII SaaS"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
