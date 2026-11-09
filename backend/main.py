from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from routers import analyze
import os

app = FastAPI(
    title="Verifio V2 API",
    description="State-of-the-art AI text detector & academic forensic content analyzer. Built by Harsh Malviya (harshhmalviya09@gmail.com).",
    version="2.0.0",
    contact={
        "name": "Harsh Malviya",
        "email": "harshhmalviya09@gmail.com",
        "url": "https://github.com/harshfly/Verifio-V2",
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "https://ghostwriter-guard-production.up.railway.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api", tags=["Analysis"])


@app.get("/", response_class=HTMLResponse)
def root():
    html_path = os.path.join(os.path.dirname(__file__), "index.html")
    with open(html_path) as f:
        return f.read()


@app.get("/health")
def health():
    return {"status": "ok"}
