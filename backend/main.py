from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine

from routers import habits, logs, users

app = FastAPI(
    title="Habit Tracker API",
    description="API for tracking daily habits",
    version="1.0.0"
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
app.include_router(habits.router)
app.include_router(logs.router)

@app.get("/")
def read_root():
    """Root endpoint - API health check"""
    return {
        "message": "Habit Tracker API is running",
        "version": "1.0.0",
        "docs": "/docs"
    }