from datetime import datetime, time, timezone
import csv
import hashlib
import io
import json
import os
import zipfile

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from fastapi.responses import RedirectResponse, StreamingResponse
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
    store_image_uploads_as_pdf,
    store_upload_file,
)
from app.routers.resources import (
    get_cloudinary_raw_pdf_error_response,
    get_inline_file_response,
    get_local_upload_path,
)

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[Depends(require_admin)],
)

ALLOWED_RESOURCE_TYPES = {"document", "file", "image", "photo", "audio", "pdf"}
ALLOWED_EVENT_STATUSES = {"coming_soon", "upcoming", "registration_open", "live", "completed"}
VIDEO_EXTENSIONS = {".mp4", ".webm", ".mov", ".m4v", ".ogg"}
IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"}


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


def get_or_create_admin_settings(
    db: Session,
    user: models.User,
) -> models.AdminSetting:
    settings = (
        db.query(models.AdminSetting)
        .filter(models.AdminSetting.user_id == user.id)
        .first()
    )
    if settings:
        return settings

    settings = models.AdminSetting(user_id=user.id)
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings


def serialize_admin_settings(settings: models.AdminSetting):
    return {
        "notifications": {
            "email": settings.notifications_email,
            "push": settings.notifications_push,
            "updates": settings.notifications_updates,
        },
        "appearance": {
            "theme": settings.appearance_theme,
            "density": settings.appearance_density,
        },
    }


def validate_admin_setting_choice(value: str, allowed_values: set[str], label: str) -> str:
    normalized = (value or "").strip().lower()
    if normalized not in allowed_values:
        raise HTTPException(status_code=400, detail=f"Unsupported {label}")
    return normalized


def utc_timestamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")


def serialize_datetime(value):
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value)


def model_to_backup_dict(item, fields: list[str]) -> dict:
    return {
        field: serialize_datetime(getattr(item, field, None))
        for field in fields
    }


def build_csv(rows: list[dict], fields: list[str]) -> str:
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fields)
    writer.writeheader()
    writer.writerows(rows)
    return output.getvalue()


def escape_pdf_text(value: str) -> str:
    return (
        str(value)
        .replace("\\", "\\\\")
        .replace("(", "\\(")
        .replace(")", "\\)")
        .replace("\r", " ")
        .replace("\n", " ")
    )


def build_simple_pdf(title: str, lines: list[str]) -> bytes:
    page_width = 612
    page_height = 792
    margin = 48
    line_height = 16
    pages = []
    current_page = []
    max_lines = 42

    for line in [title, "", *lines]:
        if len(current_page) >= max_lines:
            pages.append(current_page)
            current_page = []
        current_page.append(line[:92])

    if current_page:
        pages.append(current_page)

    objects: list[bytes] = []
    page_object_ids = []

    def add_object(content: bytes) -> int:
        objects.append(content)
        return len(objects)

    font_id = add_object(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")

    for page_lines in pages:
        content_lines = ["BT", f"/F1 12 Tf", f"{margin} {page_height - margin} Td"]
        for index, line in enumerate(page_lines):
            if index:
                content_lines.append(f"0 -{line_height} Td")
            content_lines.append(f"({escape_pdf_text(line)}) Tj")
        content_lines.append("ET")
        content = "\n".join(content_lines).encode("latin-1", "replace")
        content_id = add_object(
            b"<< /Length " + str(len(content)).encode("ascii") + b" >>\nstream\n" + content + b"\nendstream"
        )
        page_id = add_object(
            (
                f"<< /Type /Page /Parent {{PAGES_ID}} 0 R "
                f"/MediaBox [0 0 {page_width} {page_height}] "
                f"/Resources << /Font << /F1 {font_id} 0 R >> >> "
                f"/Contents {content_id} 0 R >>"
            ).encode("ascii")
        )
        page_object_ids.append(page_id)

    kids = " ".join(f"{page_id} 0 R" for page_id in page_object_ids)
    pages_id = add_object(
        f"<< /Type /Pages /Kids [{kids}] /Count {len(page_object_ids)} >>".encode("ascii")
    )
    catalog_id = add_object(f"<< /Type /Catalog /Pages {pages_id} 0 R >>".encode("ascii"))

    resolved_objects = [
        content.replace(b"{PAGES_ID}", str(pages_id).encode("ascii"))
        for content in objects
    ]

    buffer = io.BytesIO()
    buffer.write(b"%PDF-1.4\n")
    offsets = [0]
    for index, content in enumerate(resolved_objects, start=1):
        offsets.append(buffer.tell())
        buffer.write(f"{index} 0 obj\n".encode("ascii"))
        buffer.write(content)
        buffer.write(b"\nendobj\n")

    xref_offset = buffer.tell()
    buffer.write(f"xref\n0 {len(resolved_objects) + 1}\n".encode("ascii"))
    buffer.write(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        buffer.write(f"{offset:010d} 00000 n \n".encode("ascii"))
    buffer.write(
        (
            f"trailer\n<< /Size {len(resolved_objects) + 1} /Root {catalog_id} 0 R >>\n"
            f"startxref\n{xref_offset}\n%%EOF\n"
        ).encode("ascii")
    )
    return buffer.getvalue()


def normalize_optional_url(value: str | None) -> str | None:
    normalized = (value or "").strip()
    return normalized or None


def normalize_resource_upload_files(
    upload_files: list[UploadFile] | UploadFile | None,
) -> list[UploadFile]:
    if upload_files is None:
        return []

    if isinstance(upload_files, list):
        files = upload_files
    else:
        files = [upload_files]

    return [upload_file for upload_file in files if upload_file is not None and upload_file.filename]


def calculate_uploads_hash(upload_files: list[UploadFile]) -> str | None:
    if not upload_files:
        return None

    digest = hashlib.sha256()
    for upload_file in upload_files:
        digest.update((upload_file.filename or "").encode("utf-8"))
        digest.update(b"\0")
        upload_file.file.seek(0)

        for chunk in iter(lambda: upload_file.file.read(1024 * 1024), b""):
            digest.update(chunk)

        upload_file.file.seek(0)

    return digest.hexdigest()


def store_resource_uploads(
    *,
    upload_files: list[UploadFile],
    title: str,
    file_type: str,
):
    if not upload_files:
        return None

    if len(upload_files) > 1 and file_type != "image":
        raise HTTPException(
            status_code=400,
            detail="Multiple file uploads are only supported for image resources.",
        )

    if file_type == "image":
        for upload_file in upload_files:
            validate_image_upload(upload_file)

        if len(upload_files) > 1:
            return store_image_uploads_as_pdf(
                upload_files=upload_files,
                destination_dir=RESOURCE_UPLOADS_DIR,
                preferred_name=title,
            )

    return store_upload_file(
        upload_file=upload_files[0],
        destination_dir=RESOURCE_UPLOADS_DIR,
        preferred_name=title,
        file_type_hint=file_type,
    )


def find_duplicate_resource(
    db: Session,
    *,
    file_hash: str | None = None,
    original_filename: str | None = None,
    external_url: str | None = None,
    exclude_resource_id: int | None = None,
):
    query = db.query(models.Resource)

    if exclude_resource_id is not None:
        query = query.filter(models.Resource.id != exclude_resource_id)

    if file_hash:
        duplicate = query.filter(models.Resource.file_hash == file_hash).first()
        if duplicate:
            return duplicate

    normalized_filename = (original_filename or "").strip()
    if normalized_filename:
        duplicate = query.filter(models.Resource.original_filename == normalized_filename).first()
        if duplicate:
            return duplicate

    normalized_url = normalize_optional_url(external_url)
    if normalized_url:
        duplicate = query.filter(models.Resource.external_url == normalized_url).first()
        if duplicate:
            return duplicate

    return None


def raise_duplicate_resource_error(duplicate: models.Resource):
    raise HTTPException(
        status_code=409,
        detail=f"Duplicate file detected. This file already exists as '{duplicate.title}'.",
    )


def detect_event_media_type(upload_file: UploadFile) -> str:
    content_type = (upload_file.content_type or "").lower()
    extension = os.path.splitext(upload_file.filename or "")[1].lower()

    if content_type.startswith("video/") or extension in VIDEO_EXTENSIONS:
        return "video"

    raise HTTPException(status_code=400, detail="Event media must be a video file")


def validate_image_upload(upload_file: UploadFile):
    content_type = (upload_file.content_type or "").lower()
    extension = os.path.splitext(upload_file.filename or "")[1].lower()

    if content_type.startswith("image/") or content_type in IMAGE_CONTENT_TYPES:
        return

    if extension in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}:
        return

    raise HTTPException(status_code=400, detail="Optional preview image must be an image file")


def remove_resource_thumbnail(resource: models.Resource):
    remove_stored_file(
        resource.thumbnail_path,
        cloudinary_public_id=resource.thumbnail_cloudinary_public_id,
        cloudinary_resource_type=resource.thumbnail_cloudinary_resource_type,
    )
    resource.thumbnail_path = None
    resource.thumbnail_cloudinary_public_id = None
    resource.thumbnail_cloudinary_resource_type = None


def apply_resource_thumbnail_upload(resource: models.Resource, image: UploadFile | None, title: str):
    if image is None:
        return

    validate_image_upload(image)
    stored_image = store_upload_file(
        upload_file=image,
        destination_dir=RESOURCE_UPLOADS_DIR,
        preferred_name=f"{title}-preview",
        file_type_hint="image",
    )

    if stored_image["thumbnail_path"] and stored_image["thumbnail_path"] != stored_image["file_path"]:
        remove_stored_file(stored_image["thumbnail_path"])

    remove_resource_thumbnail(resource)
    resource.thumbnail_path = stored_image["file_path"]
    resource.thumbnail_cloudinary_public_id = stored_image["cloudinary_public_id"]
    resource.thumbnail_cloudinary_resource_type = stored_image["cloudinary_resource_type"]


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
    today_start = datetime.combine(datetime.now(timezone.utc).date(), time.min, tzinfo=timezone.utc)

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
        "total_downloads": db.query(func.count(models.ResourceDownload.id)).scalar() or 0,
        "downloads_today": db.query(func.count(models.ResourceDownload.id))
        .filter(models.ResourceDownload.downloaded_at >= today_start)
        .scalar()
        or 0,
    }


@router.get("/downloads", response_model=list[schemas.DownloadLogResponse])
async def get_admin_downloads(
    limit: int = Query(200, ge=1, le=500),
    db: Session = Depends(get_db),
):
    return (
        db.query(models.ResourceDownload)
        .order_by(models.ResourceDownload.downloaded_at.desc())
        .limit(limit)
        .all()
    )


@router.get("/settings", response_model=schemas.AdminSettingsResponse)
async def get_admin_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    settings = get_or_create_admin_settings(db, current_user)
    return serialize_admin_settings(settings)


@router.patch("/settings", response_model=schemas.AdminSettingsResponse)
async def update_admin_settings(
    payload: schemas.AdminSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    settings = get_or_create_admin_settings(db, current_user)

    if payload.notifications is not None:
        settings.notifications_email = payload.notifications.email
        settings.notifications_push = payload.notifications.push
        settings.notifications_updates = payload.notifications.updates

    if payload.appearance is not None:
        settings.appearance_theme = validate_admin_setting_choice(
            payload.appearance.theme,
            {"light", "dark"},
            "theme",
        )
        settings.appearance_density = validate_admin_setting_choice(
            payload.appearance.density,
            {"comfortable", "compact"},
            "density",
        )

    db.commit()
    db.refresh(settings)
    return serialize_admin_settings(settings)


@router.get("/backup")
async def download_admin_backup(db: Session = Depends(get_db)):
    resources = db.query(models.Resource).order_by(models.Resource.created_at.desc()).all()
    events = db.query(models.Event).order_by(models.Event.created_at.desc()).all()
    downloads = (
        db.query(models.ResourceDownload)
        .order_by(models.ResourceDownload.downloaded_at.desc())
        .all()
    )
    generated_at = datetime.now(timezone.utc)

    resource_fields = [
        "id",
        "title",
        "description",
        "grade_level",
        "subject",
        "category",
        "file_type",
        "file_path",
        "thumbnail_path",
        "original_filename",
        "file_hash",
        "external_url",
        "telegram_file_id",
        "cloudinary_public_id",
        "cloudinary_resource_type",
        "thumbnail_cloudinary_public_id",
        "thumbnail_cloudinary_resource_type",
        "is_published",
        "created_at",
        "updated_at",
    ]
    event_fields = [
        "id",
        "title",
        "description",
        "status",
        "location",
        "event_date",
        "image_path",
        "media_path",
        "media_type",
        "cloudinary_public_id",
        "cloudinary_resource_type",
        "cta_label",
        "cta_url",
        "is_published",
        "created_at",
        "updated_at",
    ]
    download_fields = [
        "id",
        "resource_id",
        "resource_title",
        "resource_grade_level",
        "resource_subject",
        "resource_category",
        "resource_file_type",
        "target_url",
        "ip_address",
        "user_agent",
        "referrer",
        "downloaded_at",
    ]

    resource_rows = [model_to_backup_dict(resource, resource_fields) for resource in resources]
    event_rows = [model_to_backup_dict(event, event_fields) for event in events]
    download_rows = [model_to_backup_dict(download, download_fields) for download in downloads]
    backup_payload = {
        "generated_at": generated_at.isoformat(),
        "counts": {
            "resources": len(resource_rows),
            "events": len(event_rows),
            "downloads": len(download_rows),
        },
        "resources": resource_rows,
        "events": event_rows,
        "downloads": download_rows,
    }
    pdf_lines = [
        f"Generated at: {generated_at.isoformat()}",
        f"Resources: {len(resource_rows)}",
        f"Events: {len(event_rows)}",
        f"Download records: {len(download_rows)}",
        "",
        "Latest resources:",
        *[
            f"- #{resource.id} {resource.title} ({resource.file_type}, Grade {resource.grade_level})"
            for resource in resources[:12]
        ],
        "",
        "Latest events:",
        *[
            f"- #{event.id} {event.title} ({event.status})"
            for event in events[:8]
        ],
    ]

    archive = io.BytesIO()
    with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as zip_file:
        zip_file.writestr(
            "backup-summary.pdf",
            build_simple_pdf("Grade A Admin Backup Summary", pdf_lines),
        )
        zip_file.writestr(
            "backup-data.json",
            json.dumps(backup_payload, ensure_ascii=False, indent=2),
        )
        zip_file.writestr("resources.csv", build_csv(resource_rows, resource_fields))
        zip_file.writestr("events.csv", build_csv(event_rows, event_fields))
        zip_file.writestr("downloads.csv", build_csv(download_rows, download_fields))

    archive.seek(0)
    filename = f"grade-a-admin-backup-{utc_timestamp()}.zip"
    return StreamingResponse(
        archive,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/resources", response_model=list[schemas.ResourceResponse])
async def get_admin_resources(db: Session = Depends(get_db)):
    return db.query(models.Resource).order_by(models.Resource.created_at.desc()).all()


@router.get("/resources/{resource_id}/view")
async def view_admin_resource(resource_id: int, db: Session = Depends(get_db)):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    target_url = resource.external_url or resource.file_path
    if not target_url:
        raise HTTPException(status_code=404, detail="Resource file not found")

    local_file_path = get_local_upload_path(resource.file_path)
    if local_file_path:
        return get_inline_file_response(resource, local_file_path)

    if (
        resource.cloudinary_resource_type == "raw" and
        os.path.splitext(resource.file_path or "")[1].lower() == ".pdf"
    ):
        return get_cloudinary_raw_pdf_error_response()

    return RedirectResponse(url=target_url, status_code=302)


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
    file: list[UploadFile] | UploadFile | None = File(None),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    """Upload a new resource (file, image, or audio)."""

    ensure_storage_dirs()
    normalized_file_type = normalize_resource_type(file_type)
    normalized_external_url = normalize_optional_url(external_url)
    validated_grade_level, normalized_subject, normalized_category = validate_admin_resource_catalog(
        grade_level=grade_level,
        subject=subject,
        category=category,
        file_type=normalized_file_type,
    )
    upload_files = normalize_resource_upload_files(file)
    stored_file = None
    file_hash = calculate_uploads_hash(upload_files)
    duplicate = find_duplicate_resource(
        db,
        file_hash=file_hash,
        original_filename=upload_files[0].filename if len(upload_files) == 1 else None,
        external_url=normalized_external_url,
    )
    if duplicate:
        raise_duplicate_resource_error(duplicate)

    stored_file = store_resource_uploads(
        upload_files=upload_files,
        title=title,
        file_type=normalized_file_type,
    )

    if not stored_file and not normalized_external_url:
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
        file_hash=file_hash,
        cloudinary_public_id=stored_file["cloudinary_public_id"] if stored_file else None,
        cloudinary_resource_type=stored_file["cloudinary_resource_type"] if stored_file else None,
        external_url=normalized_external_url,
        is_published=is_published,
    )

    if normalized_file_type in {"audio", "document"}:
        apply_resource_thumbnail_upload(db_resource, image, title)

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
    file: list[UploadFile] | UploadFile | None = File(None),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    resource = db.query(models.Resource).filter(models.Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    normalized_file_type = normalize_resource_type(file_type)
    normalized_external_url = normalize_optional_url(external_url)
    validated_grade_level, normalized_subject, normalized_category = validate_admin_resource_catalog(
        grade_level=grade_level,
        subject=subject,
        category=category,
        file_type=normalized_file_type,
    )
    upload_files = normalize_resource_upload_files(file)
    stored_file = None
    file_hash = calculate_uploads_hash(upload_files)
    duplicate = find_duplicate_resource(
        db,
        file_hash=file_hash,
        original_filename=upload_files[0].filename if len(upload_files) == 1 else None,
        external_url=normalized_external_url,
        exclude_resource_id=resource_id,
    )
    if duplicate:
        raise_duplicate_resource_error(duplicate)

    stored_file = store_resource_uploads(
        upload_files=upload_files,
        title=title,
        file_type=normalized_file_type,
    )

    if stored_file:
        remove_stored_file(
            resource.file_path,
            cloudinary_public_id=resource.cloudinary_public_id,
            cloudinary_resource_type=resource.cloudinary_resource_type,
        )
        if resource.file_type in {"image", "photo"} or normalized_file_type == "image":
            remove_resource_thumbnail(resource)
        resource.file_path = stored_file["file_path"]
        resource.thumbnail_path = stored_file["thumbnail_path"] if normalized_file_type == "image" else resource.thumbnail_path
        resource.original_filename = stored_file["original_filename"]
        resource.file_hash = file_hash
        resource.cloudinary_public_id = stored_file["cloudinary_public_id"]
        resource.cloudinary_resource_type = stored_file["cloudinary_resource_type"]

    if normalized_file_type in {"audio", "document"}:
        apply_resource_thumbnail_upload(resource, image, title)

    resource.title = title
    resource.description = description
    resource.grade_level = validated_grade_level
    resource.subject = normalized_subject
    resource.category = normalized_category
    resource.file_type = normalized_file_type
    resource.external_url = normalized_external_url
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
    remove_resource_thumbnail(resource)
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
