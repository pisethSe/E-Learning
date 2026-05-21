from datetime import datetime
import os

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.auth import require_admin
from app.catalog import AUDIO_SUBJECT, validate_resource_catalog
from app.services.file_service import (
    EVENT_UPLOADS_DIR,
    download_telegram_file_to_storage,
    ensure_storage_dirs,
    remove_stored_file,
    RESOURCE_UPLOADS_DIR,
    store_upload_file,
)

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[Depends(require_admin)],
)

ALLOWED_RESOURCE_TYPES = {"document", "file", "image", "photo", "audio", "pdf"}
ALLOWED_EVENT_STATUSES = {"coming_soon", "upcoming", "registration_open", "live", "completed"}
VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov", ".m4v", ".ogg"}


def normalize_resource_type(file_type: str) -> str:
    normalized = (file_type or "").strip().lower()
    if normalized not in ALLOWED_RESOURCE_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported resource file_type")
    if normalized in {"file", "pdf"}:
        return "document"
    if normalized == "photo":
        return "image"
    return normalized


def validate_admin_resource_catalog(
    *,
    grade_level: int,
    subject: str,
    category: str | None,
    file_type: str,
):
    try:
        validated_grade, normalized_subject, normalized_category = validate_resource_catalog(
            grade_level=grade_level,
            subject=subject,
            category=category,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if file_type == "audio" and normalized_subject != AUDIO_SUBJECT:
        raise HTTPException(
            status_code=400,
            detail="Audio uploads must use Khmer Literature / អក្សរសាស្ត្រខ្មែរ",
        )

    return validated_grade, normalized_subject, normalized_category


def normalize_event_status(status: str) -> str:
    normalized = (status or "coming_soon").strip().lower()
    if normalized not in ALLOWED_EVENT_STATUSES:
        raise HTTPException(status_code=400, detail="Unsupported event status")
    return normalized


def detect_event_media_type(upload_file: UploadFile) -> str:
    content_type = (upload_file.content_type or "").lower()
    extension = os.path.splitext(upload_file.filename or "")[1].lower()

    if content_type.startswith("video/") or extension in VIDEO_EXTENSIONS:
        return "video"

    raise HTTPException(status_code=400, detail="Event media must be a video file")


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
    validated_grade_level, normalized_subject, normalized_category = validate_admin_resource_catalog(
        grade_level=grade_level,
        subject=subject,
        category=category,
        file_type=normalized_file_type,
    )
    stored_file = None

    if file is not None:
        stored_file = store_upload_file(
            upload_file=file,
            destination_dir=RESOURCE_UPLOADS_DIR,
            preferred_name=title,
            file_type_hint=normalized_file_type,
        )

    if not stored_file and not external_url:
        raise HTTPException(status_code=400, detail="Provide a file upload or external_url")

    db_resource = models.Resource(
        title=title,
        description=description,
        grade_level=validated_grade_level,
        subject=normalized_subject,
        category=normalized_category,
        file_type=normalized_file_type,
        file_path=stored_file["file_path"] if stored_file else None,
        thumbnail_path=stored_file["thumbnail_path"] if stored_file else None,
        original_filename=stored_file["original_filename"] if stored_file else None,
        cloudinary_public_id=stored_file["cloudinary_public_id"] if stored_file else None,
        cloudinary_resource_type=stored_file["cloudinary_resource_type"] if stored_file else None,
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
    validated_grade_level, normalized_subject, normalized_category = validate_admin_resource_catalog(
        grade_level=grade_level,
        subject=subject,
        category=category,
        file_type=normalized_file_type,
    )
    stored_file = None
    if file is not None:
        stored_file = store_upload_file(
            upload_file=file,
            destination_dir=RESOURCE_UPLOADS_DIR,
            preferred_name=title,
            file_type_hint=normalized_file_type,
        )

    if stored_file:
        remove_stored_file(
            resource.file_path,
            cloudinary_public_id=resource.cloudinary_public_id,
            cloudinary_resource_type=resource.cloudinary_resource_type,
        )
        remove_stored_file(resource.thumbnail_path)
        resource.file_path = stored_file["file_path"]
        resource.thumbnail_path = stored_file["thumbnail_path"]
        resource.original_filename = stored_file["original_filename"]
        resource.cloudinary_public_id = stored_file["cloudinary_public_id"]
        resource.cloudinary_resource_type = stored_file["cloudinary_resource_type"]

    resource.title = title
    resource.description = description
    resource.grade_level = validated_grade_level
    resource.subject = normalized_subject
    resource.category = normalized_category
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

    remove_stored_file(
        resource.file_path,
        cloudinary_public_id=resource.cloudinary_public_id,
        cloudinary_resource_type=resource.cloudinary_resource_type,
    )
    remove_stored_file(resource.thumbnail_path)
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

    normalized_file_type = normalize_resource_type(file_type)
    validated_grade_level, normalized_subject, normalized_category = validate_admin_resource_catalog(
        grade_level=grade_level,
        subject=subject,
        category=category,
        file_type=normalized_file_type,
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
        grade_level=validated_grade_level,
        subject=normalized_subject,
        category=normalized_category,
        file_type=normalized_file_type,
        file_path=downloaded_file["file_path"],
        thumbnail_path=downloaded_file["thumbnail_path"],
        original_filename=downloaded_file.get("original_filename") or original_filename,
        telegram_file_id=telegram_file_id,
        cloudinary_public_id=downloaded_file.get("cloudinary_public_id"),
        cloudinary_resource_type=downloaded_file.get("cloudinary_resource_type"),
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

    remove_stored_file(
        resource.file_path,
        cloudinary_public_id=resource.cloudinary_public_id,
        cloudinary_resource_type=resource.cloudinary_resource_type,
    )
    remove_stored_file(resource.thumbnail_path)

    resource.file_path = downloaded_file["file_path"]
    resource.thumbnail_path = downloaded_file["thumbnail_path"]
    resource.original_filename = downloaded_file.get("original_filename") or original_filename
    resource.cloudinary_public_id = downloaded_file.get("cloudinary_public_id")
    resource.cloudinary_resource_type = downloaded_file.get("cloudinary_resource_type")
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
    media: UploadFile | None = File(None),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    upload = media or image
    stored_media = None
    media_type = "video"

    if upload is not None:
        media_type = detect_event_media_type(upload)
        stored_media = store_upload_file(
            upload_file=upload,
            destination_dir=EVENT_UPLOADS_DIR,
            preferred_name=title,
            file_type_hint=media_type,
        )

    event = models.Event(
        title=title,
        description=description,
        status=normalize_event_status(status),
        location=location,
        event_date=parse_optional_datetime(event_date),
        image_path=stored_media["file_path"] if stored_media and media_type == "image" else None,
        media_path=stored_media["file_path"] if stored_media else None,
        media_type=media_type,
        cloudinary_public_id=stored_media["cloudinary_public_id"] if stored_media else None,
        cloudinary_resource_type=stored_media["cloudinary_resource_type"] if stored_media else None,
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
    media: UploadFile | None = File(None),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    upload = media or image
    stored_media = None
    media_type = event.media_type or "image"

    if upload is not None:
        media_type = detect_event_media_type(upload)
        stored_media = store_upload_file(
            upload_file=upload,
            destination_dir=EVENT_UPLOADS_DIR,
            preferred_name=title,
            file_type_hint=media_type,
        )

    if stored_media:
        remove_stored_file(
            event.media_path,
            cloudinary_public_id=event.cloudinary_public_id,
            cloudinary_resource_type=event.cloudinary_resource_type,
        )
        remove_stored_file(event.image_path)
        event.image_path = stored_media["file_path"] if media_type == "image" else None
        event.media_path = stored_media["file_path"]
        event.media_type = media_type
        event.cloudinary_public_id = stored_media["cloudinary_public_id"]
        event.cloudinary_resource_type = stored_media["cloudinary_resource_type"]

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

    remove_stored_file(
        event.media_path,
        cloudinary_public_id=event.cloudinary_public_id,
        cloudinary_resource_type=event.cloudinary_resource_type,
    )
    remove_stored_file(event.image_path)
    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}
