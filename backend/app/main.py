from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import chat, analyze, auth

app = FastAPI(
    title="Rule VII SaaS API",
    description="AI Architectural Mentor Backend",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(analyze.router, prefix="/api/v1/analyze", tags=["analyze"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])

@app.get("/")
async def root():
    return {"message": "Rule VII SaaS API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
