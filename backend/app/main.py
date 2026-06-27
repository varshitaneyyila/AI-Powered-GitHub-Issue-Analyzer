from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import repos, analysis, stats, history, favorites

app = FastAPI(
    title="AI-Powered GitHub Issue Analyzer API",
    description="Week 1: fetches GitHub repo issues. AI + DB + charts added in later weeks.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(repos.router)
app.include_router(analysis.router)
app.include_router(stats.router)
app.include_router(history.router)
app.include_router(favorites.router)


@app.get("/")
def health_check():
    return {"status": "ok", "message": "AI GitHub Issue Analyzer API is running"}
