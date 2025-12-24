from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import chat, analyze, auth, projects, users, project_files
from app.core.security import verify_token  # <--- Import the security function

app = FastAPI(
    title="Rule VII SaaS API",
    description="AI Architectural Mentor Backend",
    version="1.0.0"
)

# CORS
# In production, change ["*"] to ["https://your-frontend-domain.com"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DEBUG: Log all requests
@app.middleware("http")
async def log_requests(request, call_next):
    print(f"🌐 {request.method} {request.url.path}")
    print(f"📋 Headers: {dict(request.headers)}")
    response = await call_next(request)
    print(f"📤 Response status: {response.status_code}")
    return response

# --- PROTECTED ROUTES (Lock these) ---
app.include_router(
    chat.router,
    prefix="/api/v1/chat",
    tags=["chat"],
    dependencies=[Depends(verify_token)]  # Apply auth at router level
)
app.include_router(
    analyze.router,
    prefix="/api/v1/analyze",
    tags=["analyze"],
    dependencies=[Depends(verify_token)]  # <--- This locks the door
)

app.include_router(
    projects.router,
    # This sets the URL to http://localhost:8000/api/v1/projects
    prefix="/api/v1/projects",
    tags=["projects"],
    # This protects ALL project routes automatically
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
