from datetime import datetime
import os

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.services.file_service import (
    EVENT_UPLOADS_DIR,
    build_public_path,
    download_telegram_file_to_storage,
    ensure_storage_dirs,
    remove_public_file,
    RESOURCE_UPLOADS_DIR,
    store_upload_file,
)

router = APIRouter(prefix="/api/admin", tags=["admin"])

ALLOWED_RESOURCE_TYPES = {"document", "image", "audio", "pdf"}
ALLOWED_EVENT_STATUSES = {"coming_soon", "upcoming", "registration_open", "live", "completed"}


def normalize_resource_type(file_type: str) -> str:
    normalized = (file_type or "").strip().lower()
    if normalized not in ALLOWED_RESOURCE_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported resource file_type")
    if normalized == "pdf":
        return "document"
    return normalized


def normalize_event_status(status: str) -> str:
    normalized = (status or "coming_soon").strip().lower()
    if normalized not in ALLOWED_EVENT_STATUSES:
        raise HTTPException(status_code=400, detail="Unsupported event status")
    return normalized


def parse_optional_datetime(value: str | None):
    if not value:
        return None

    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid event_date format") from exc


@router.get("/stats", response_model=schemas.AdminStatsResponse)
async def get_admin_stats(db: Session = Depends(get_db)):
    total_resources = db.query(func.count(models.Resource.id)).scalar() or 0
    total_events = db.query(func.count(models.Event.id)).scalar() or 0

    return {
        "total_resources": total_resources,
        "total_documents": db.query(func.count(models.Resource.id))
        .filter(models.Resource.file_type == "document")
        .scalar()
        or 0,
        "total_images": db.query(func.count(models.Resource.id))
        .filter(models.Resource.file_type == "image")
        .scalar()
        or 0,
        "total_audio": db.query(func.count(models.Resource.id))
        .filter(models.Resource.file_type == "audio")
        .scalar()
        or 0,
        "published_resources": db.query(func.count(models.Resource.id))
        .filter(models.Resource.is_published.is_(True))
        .scalar()
        or 0,
        "total_events": total_events,
        "published_events": db.query(func.count(models.Event.id))
        .filter(models.Event.is_published.is_(True))
        .scalar()
        or 0,
    }


@router.get("/resources", response_model=list[schemas.ResourceResponse])
async def get_admin_resources(db: Session = Depends(get_db)):
    return db.query(models.Resource).order_by(models.Resource.created_at.desc()).all()


@router.post("/resources/upload", response_model=schemas.ResourceResponse)
async def upload_resource(
    title: str = Form(...),
    grade_level: int = Form(...),
    subject: str = Form(...),
    file_type: str = Form(...),
    description: str | None = Form(None),
    category: str | None = Form(None),
    external_url: str | None = Form(None),
    is_published: bool = Form(True),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    """Upload a new resource (file, image, or audio)."""

    ensure_storage_dirs()
    normalized_file_type = normalize_resource_type(file_type)
    stored_file = None

    if file is not None:
        stored_file = store_upload_file(
            upload_file=file,
            destination_dir=RESOURCE_UPLOADS_DIR,
            preferred_name=title,
        )

    if not stored_file and not external_url:
        raise HTTPException(status_code=400, detail="Provide a file upload or external_url")

    db_resource = models.Resource(
        title=title,
        description=description,
        grade_level=grade_level,
        subject=subject,
        category=category,
        file_type=normalized_file_type,
        file_path=stored_file["file_path"] if stored_file else None,
        thumbnail_path=stored_file["thumbnail_path"] if stored_file else None,
        original_filename=stored_file["original_filename"] if stored_file else None,
        external_url=external_url,
        is_published=is_published,
    )

    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource


@router.put("/resources/{resource_id}", response_model=schemas.ResourceResponse)
async def update_resource(
    resource_id: int,
    title: str = Form(...),
    grade_level: int = Form(...),
    subject: str = Form(...),
    file_type: str = Form(...),
    description: str | None = Form(None),
    category: str | None = Form(None),
    external_url: str | None = Form(None),
    is_published: bool = Form(True),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    normalized_file_type = normalize_resource_type(file_type)
    stored_file = None
    if file is not None:
        stored_file = store_upload_file(
            upload_file=file,
            destination_dir=RESOURCE_UPLOADS_DIR,
            preferred_name=title,
        )

    if stored_file:
        remove_public_file(resource.file_path)
        remove_public_file(resource.thumbnail_path)
        resource.file_path = stored_file["file_path"]
        resource.thumbnail_path = stored_file["thumbnail_path"]
        resource.original_filename = stored_file["original_filename"]

    resource.title = title
    resource.description = description
    resource.grade_level = grade_level
    resource.subject = subject
    resource.category = category
    resource.file_type = normalized_file_type
    resource.external_url = external_url
    resource.is_published = is_published

    db.commit()
    db.refresh(resource)
    return resource


@router.delete("/resources/{resource_id}")
async def delete_resource(resource_id: int, db: Session = Depends(get_db)):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    remove_public_file(resource.file_path)
    remove_public_file(resource.thumbnail_path)
    db.delete(resource)
    db.commit()

    return {"message": "Resource deleted successfully"}


@router.post("/resources/import-telegram", response_model=schemas.ResourceResponse)
async def import_telegram_resource(
    title: str = Form(...),
    grade_level: int = Form(...),
    subject: str = Form(...),
    file_type: str = Form(...),
    telegram_file_id: str = Form(...),
    description: str | None = Form(None),
    category: str | None = Form(None),
    original_filename: str | None = Form(None),
    is_published: bool = Form(True),
    db: Session = Depends(get_db),
):
    """Download a Telegram file to local storage and create a resource record."""

    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not bot_token or bot_token == "your-telegram-bot-token-here":
        raise HTTPException(
            status_code=400,
            detail="TELEGRAM_BOT_TOKEN is not configured",
        )

    try:
        downloaded_file = await download_telegram_file_to_storage(
            bot_token=bot_token,
            telegram_file_id=telegram_file_id,
            preferred_name=original_filename or title,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to download Telegram file: {exc}",
        ) from exc

    db_resource = models.Resource(
        title=title,
        description=description,
        grade_level=grade_level,
        subject=subject,
        category=category,
        file_type=normalize_resource_type(file_type),
        file_path=downloaded_file["file_path"],
        thumbnail_path=downloaded_file["thumbnail_path"],
        original_filename=original_filename,
        telegram_file_id=telegram_file_id,
        is_published=is_published,
    )

    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)

    return db_resource


@router.post("/resources/{resource_id}/download-telegram", response_model=schemas.ResourceResponse)
async def download_telegram_resource_file(
    resource_id: int,
    original_filename: str = Form(None),
    db: Session = Depends(get_db),
):
    """Download a Telegram-backed resource file to local storage and update its paths."""

    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    if not resource.telegram_file_id:
        raise HTTPException(
            status_code=400,
            detail="This resource does not have a telegram_file_id",
        )

    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not bot_token or bot_token == "your-telegram-bot-token-here":
        raise HTTPException(
            status_code=400,
            detail="TELEGRAM_BOT_TOKEN is not configured",
        )

    try:
        downloaded_file = await download_telegram_file_to_storage(
            bot_token=bot_token,
            telegram_file_id=resource.telegram_file_id,
            preferred_name=original_filename or resource.title,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to download Telegram file: {exc}",
        ) from exc

    resource.file_path = downloaded_file["file_path"]
    resource.thumbnail_path = downloaded_file["thumbnail_path"]
    db.commit()
    db.refresh(resource)

    return resource


@router.get("/events", response_model=list[schemas.EventResponse])
async def get_admin_events(db: Session = Depends(get_db)):
    return db.query(models.Event).order_by(models.Event.event_date.asc(), models.Event.created_at.desc()).all()


@router.post("/events", response_model=schemas.EventResponse)
async def create_event(
    title: str = Form(...),
    description: str | None = Form(None),
    status: str = Form("coming_soon"),
    location: str | None = Form(None),
    event_date: str | None = Form(None),
    cta_label: str | None = Form(None),
    cta_url: str | None = Form(None),
    is_published: bool = Form(True),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    stored_image = None
    if image is not None:
        stored_image = store_upload_file(
            upload_file=image,
            destination_dir=EVENT_UPLOADS_DIR,
            preferred_name=title,
        )

    event = models.Event(
        title=title,
        description=description,
        status=normalize_event_status(status),
        location=location,
        event_date=parse_optional_datetime(event_date),
        image_path=stored_image["file_path"] if stored_image else None,
        cta_label=cta_label,
        cta_url=cta_url,
        is_published=is_published,
    )

    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.put("/events/{event_id}", response_model=schemas.EventResponse)
async def update_event(
    event_id: int,
    title: str = Form(...),
    description: str | None = Form(None),
    status: str = Form("coming_soon"),
    location: str | None = Form(None),
    event_date: str | None = Form(None),
    cta_label: str | None = Form(None),
    cta_url: str | None = Form(None),
    is_published: bool = Form(True),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    stored_image = None
    if image is not None:
        stored_image = store_upload_file(
            upload_file=image,
            destination_dir=EVENT_UPLOADS_DIR,
            preferred_name=title,
        )

    if stored_image:
        remove_public_file(event.image_path)
        event.image_path = stored_image["file_path"]

    event.title = title
    event.description = description
    event.status = normalize_event_status(status)
    event.location = location
    event.event_date = parse_optional_datetime(event_date)
    event.cta_label = cta_label
    event.cta_url = cta_url
    event.is_published = is_published

    db.commit()
    db.refresh(event)
    return event


@router.delete("/events/{event_id}")
async def delete_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    remove_public_file(event.image_path)
    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}
