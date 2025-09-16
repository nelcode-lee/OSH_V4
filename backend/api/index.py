from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Operator Skills Hub API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Operator Skills Hub API is running!", "status": "healthy"}

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/api/auth/test")
async def test_auth():
    return {"message": "Authentication endpoint is working!", "status": "success"}

@app.get("/api/users/test")
async def test_users():
    return {"message": "Users endpoint is working!", "status": "success"}

# Vercel handler
def handler(request):
    """Vercel serverless handler."""
    return app(request)
