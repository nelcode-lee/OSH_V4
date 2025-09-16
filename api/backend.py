"""
FastAPI Backend for Operator Skills Hub
Connects to Neon DB and provides real API endpoints
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import uvicorn

# Import from backend
from app.core.database import get_db, create_tables
from app.core.config import settings
from app.api import auth, courses, ai, messaging, user_profiles, course_requests

# Create FastAPI app
app = FastAPI(
    title="Operator Skills Hub API",
    description="API for construction industry learning management system",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(courses.router, prefix="/api/courses", tags=["Courses"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(messaging.router, prefix="/api/messaging", tags=["Messaging"])
app.include_router(user_profiles.router, prefix="/api/user-profiles", tags=["User Profiles"])
app.include_router(course_requests.router, prefix="/api/course-requests", tags=["Course Requests"])

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    try:
        create_tables()
        print("✅ Database tables created successfully")
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")

@app.get("/")
async def root():
    return {"message": "Operator Skills Hub API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

# Handler for Vercel
def handler(request):
    return app(request.scope, request.receive)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
