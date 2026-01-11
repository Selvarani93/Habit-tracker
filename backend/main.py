from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine

from routers import users, routine_tasks, logs, interviews, analytics

app = FastAPI(
    title="Habit Tracker API",
    description="Comprehensive routine tracking, daily logging, analytics, and interview management system",
    version="2.0.0"
)

# Configure CORS (Cross-Origin Resource Sharing) for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables automatically (will only create if they don't exist)
Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(users.router)
app.include_router(routine_tasks.router)
app.include_router(logs.router)
app.include_router(interviews.router)
app.include_router(analytics.router)

@app.get("/")
def read_root():
    """Root endpoint - API health check"""
    return {
        "message": "Habit Tracker API is running",
        "version": "2.0.0",
        "docs": "/docs",
        "modules": ["users", "routine-tasks", "daily-logs", "interviews", "analytics"]
    }