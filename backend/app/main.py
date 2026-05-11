from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app import models
from app.database import Base, engine
from app.services.telegram_service import get_telegram_source
from app.services.file_service import ensure_storage_dirs

# Create FastAPI app instance
app = FastAPI(
    title="JUJIA PASIFU E-Learning API",
    description="Backend API for grades 9-12 e-learning platform",
    version="1.0.0"
)

Base.metadata.create_all(bind=engine)
ensure_storage_dirs()


def ensure_resources_schema():
    with engine.begin() as connection:
        columns = {
            row[1]
            for row in connection.execute(text("PRAGMA table_info(resources)"))
        }
        resource_alterations = {
            "thumbnail_path": "ALTER TABLE resources ADD COLUMN thumbnail_path VARCHAR(500)",
            "category": "ALTER TABLE resources ADD COLUMN category VARCHAR(100)",
            "original_filename": "ALTER TABLE resources ADD COLUMN original_filename VARCHAR(255)",
            "external_url": "ALTER TABLE resources ADD COLUMN external_url VARCHAR(500)",
            "is_published": "ALTER TABLE resources ADD COLUMN is_published BOOLEAN DEFAULT 1",
        }

        for column_name, statement in resource_alterations.items():
            if column_name not in columns:
                connection.execute(text(statement))


ensure_resources_schema()

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to JUJIA PASIFU E-Learning API",
        "status": "online",
        "version": "1.0.0",
        "resource_source": get_telegram_source(),
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

uploads_dir = Path(__file__).resolve().parents[1] / "uploads"
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Import and include routers
from app.routers import admin, events, resources

app.include_router(resources.router)
app.include_router(events.router)
app.include_router(admin.router)
