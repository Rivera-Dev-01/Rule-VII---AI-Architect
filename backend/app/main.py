import os
from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.api.v1 import chat, analyze, auth, projects, users, project_files
from app.core.security import verify_token
from app.core.config import settings
import logging

# Configure logging based on DEBUG setting
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Rule VII SaaS API",
    description="AI Architectural Mentor Backend",
    version="1.0.0"
)

# Attach limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS - Secure configuration
# In development (DEBUG=True), allow localhost
# In production, only allow your frontend domain
allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Add production frontend URL if configured
if settings.FRONTEND_URL and settings.FRONTEND_URL not in allowed_origins:
    allowed_origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Request logging middleware - only logs non-sensitive info
@app.middleware("http")
async def log_requests(request: Request, call_next):
    # Only log in debug mode, and never log sensitive headers
    if settings.DEBUG:
        logger.debug(f"📨 {request.method} {request.url.path}")
    
    response = await call_next(request)
    
    if settings.DEBUG:
        logger.debug(f"📤 Response: {response.status_code}")
    
    return response

# --- PROTECTED ROUTES (Lock these) ---
app.include_router(
    chat.router,
    prefix="/api/v1/chat",
    tags=["chat"],
    dependencies=[Depends(verify_token)]
)
app.include_router(
    analyze.router,
    prefix="/api/v1/analyze",
    tags=["analyze"],
    dependencies=[Depends(verify_token)]
)

app.include_router(
    projects.router,
    prefix="/api/v1/projects",
    tags=["projects"],
    dependencies=[Depends(verify_token)]
)

# Project Files (upload, get, delete)
app.include_router(
    project_files.router,
    prefix="/api/v1/projects",
    tags=["project-files"],
    dependencies=[Depends(verify_token)]
)

app.include_router(
    users.router,
    prefix="/api/v1/users",
    tags=["users"],
    dependencies=[Depends(verify_token)]
)


# --- PUBLIC ROUTES (Leave these open) ---
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])


@app.get("/")
async def root():
    return {"message": "Rule VII SaaS API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
