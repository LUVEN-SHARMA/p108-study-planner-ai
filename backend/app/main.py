from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.db.session import engine, Base
from backend.app.api.routes import goals, availability, plan, sessions
from backend.app.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Powered Study Planner API",
    description="FastAPI Backend for Day-wise Study Scheduling with Spaced Repetition and Adaptive Re-planning",
    version="1.0.0"
)

# Enable CORS for Streamlit frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(goals.router)
app.include_router(availability.router)
app.include_router(plan.router)
app.include_router(sessions.router)

@app.get("/", tags=["Health Check"])
def root():
    return {
        "status": "online",
        "service": "AI-Powered Study Planner API",
        "version": "1.0.0",
        "provider": settings.LLM_PROVIDER
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
