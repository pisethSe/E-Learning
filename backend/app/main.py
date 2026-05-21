import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text

from app import models
from app.auth import ensure_default_admin
from app.database import Base, SessionLocal, engine
from app.services.telegram_service import get_telegram_source
from app.services.file_service import ensure_storage_dirs, get_storage_backend

DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:5176",
]


def get_cors_origins():
    configured_origins = [
        origin.strip()
        for origin in os.getenv("FRONTEND_ORIGINS", "").split(",")
        if origin.strip()
    ]

    return sorted(set([*DEFAULT_CORS_ORIGINS, *configured_origins]))


# Create FastAPI app instance
app = FastAPI(
    title="JUJIA PASIFU E-Learning API",
    description="Backend API for grades 9-12 e-learning platform",
    version="1.0.0"
)

Base.metadata.create_all(bind=engine)
ensure_storage_dirs()

with SessionLocal() as startup_db:
    ensure_default_admin(startup_db)


def ensure_resources_schema():
    inspector = inspect(engine)
    if not inspector.has_table("resources"):
        return

    with engine.begin() as connection:
        columns = {
            column["name"]
            for column in inspector.get_columns("resources")
        }
        boolean_default = "TRUE" if engine.dialect.name == "postgresql" else "1"
        resource_alterations = {
            "thumbnail_path": "ALTER TABLE resources ADD COLUMN thumbnail_path VARCHAR(500)",
            "category": "ALTER TABLE resources ADD COLUMN category VARCHAR(100)",
            "original_filename": "ALTER TABLE resources ADD COLUMN original_filename VARCHAR(255)",
            "external_url": "ALTER TABLE resources ADD COLUMN external_url VARCHAR(500)",
            "is_published": f"ALTER TABLE resources ADD COLUMN is_published BOOLEAN DEFAULT {boolean_default}",
            "cloudinary_public_id": "ALTER TABLE resources ADD COLUMN cloudinary_public_id VARCHAR(500)",
            "cloudinary_resource_type": "ALTER TABLE resources ADD COLUMN cloudinary_resource_type VARCHAR(50)",
        }

        for column_name, statement in resource_alterations.items():
            if column_name not in columns:
                connection.execute(text(statement))


ensure_resources_schema()


def ensure_events_schema():
    inspector = inspect(engine)
    if not inspector.has_table("events"):
        return

    with engine.begin() as connection:
        columns = {
            column["name"]
            for column in inspector.get_columns("events")
        }
        event_alterations = {
            "media_path": "ALTER TABLE events ADD COLUMN media_path VARCHAR(500)",
            "media_type": "ALTER TABLE events ADD COLUMN media_type VARCHAR(50) DEFAULT 'video'",
            "cloudinary_public_id": "ALTER TABLE events ADD COLUMN cloudinary_public_id VARCHAR(500)",
            "cloudinary_resource_type": "ALTER TABLE events ADD COLUMN cloudinary_resource_type VARCHAR(50)",
        }

        for column_name, statement in event_alterations.items():
            if column_name not in columns:
                connection.execute(text(statement))


ensure_events_schema()


def ensure_column_defaults():
    if engine.dialect.name != "postgresql":
        return

    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE events ALTER COLUMN media_type SET DEFAULT 'video'"))


ensure_column_defaults()


def ensure_filter_indexes():
    index_statements = [
        "CREATE INDEX IF NOT EXISTS ix_resources_grade_level ON resources (grade_level)",
        "CREATE INDEX IF NOT EXISTS ix_resources_subject ON resources (subject)",
        "CREATE INDEX IF NOT EXISTS ix_resources_category ON resources (category)",
        "CREATE INDEX IF NOT EXISTS ix_resources_file_type ON resources (file_type)",
        "CREATE INDEX IF NOT EXISTS ix_resources_is_published ON resources (is_published)",
        "CREATE INDEX IF NOT EXISTS ix_events_status ON events (status)",
        "CREATE INDEX IF NOT EXISTS ix_events_media_type ON events (media_type)",
        "CREATE INDEX IF NOT EXISTS ix_events_is_published ON events (is_published)",
    ]

    with engine.begin() as connection:
        for statement in index_statements:
            connection.execute(text(statement))


ensure_filter_indexes()

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
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
        "storage_backend": get_storage_backend(),
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

uploads_dir = Path(__file__).resolve().parents[1] / "uploads"
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Import and include routers
from app import auth
from app.routers import admin, events, resources

app.include_router(auth.router)
app.include_router(resources.router)
app.include_router(events.router)
app.include_router(admin.router)
