from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.catalog import (
    GRADE_LEVELS,
    AUDIO_SUBJECT,
    RESOURCE_CATEGORIES,
    SUBJECT_LABELS,
    SUBJECTS_BY_GRADE,
    category_filter_values,
    get_all_subjects,
    normalize_subject,
)
from app.services.file_service import UPLOADS_DIR

router = APIRouter(prefix="/api/resources", tags=["resources"])


def get_download_filename(resource: models.Resource) -> str:
    fallback_name = "image" if resource.file_type == "image" else "resource"
    raw_name = resource.original_filename or resource.title or fallback_name
    return "".join("-" if character in '\\/:*?"<>|' else character for character in raw_name).strip() or fallback_name


def get_local_upload_path(public_path: str | None) -> Path | None:
    if not public_path or not public_path.startswith("/uploads/"):
        return None

    relative_path = public_path.removeprefix("/uploads/").strip("/")
    target_path = (UPLOADS_DIR / relative_path).resolve()
    uploads_root = UPLOADS_DIR.resolve()

    if uploads_root != target_path and uploads_root not in target_path.parents:
        return None

    if not target_path.is_file():
        return None

    return target_path


def get_cloudinary_attachment_url(file_url: str | None) -> str | None:
    if not file_url or "res.cloudinary.com" not in file_url or "/upload/" not in file_url:
        return None

    return file_url.replace("/upload/", "/upload/fl_attachment/", 1)


def get_cloudinary_raw_pdf_error_response() -> HTMLResponse:
    return HTMLResponse(
        """
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>File unavailable</title>
            <style>
              body {
                margin: 0;
                min-height: 100vh;
                display: grid;
                place-items: center;
                background: #f8fafc;
                color: #0f172a;
                font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
              }
              main {
                width: min(92vw, 34rem);
                border: 1px solid rgba(15, 23, 42, 0.12);
                border-radius: 1rem;
                background: white;
                padding: 1.5rem;
                box-shadow: 0 24px 70px rgba(15, 23, 42, 0.12);
              }
              h1 { margin: 0 0 .75rem; font-size: 1.25rem; }
              p { margin: 0; color: rgba(15, 23, 42, 0.68); line-height: 1.7; }
            </style>
          </head>
          <body>
            <main>
              <h1>File needs to be re-uploaded</h1>
              <p>This PDF was stored on Cloudinary as a raw file, but Cloudinary is blocking public PDF delivery. Please re-upload this file from the admin panel. New document uploads are now stored locally so they can open normally.</p>
            </main>
          </body>
        </html>
        """,
        status_code=409,
    )


def get_inline_file_response(resource: models.Resource, file_path: Path) -> FileResponse:
    return FileResponse(
        path=file_path,
        filename=get_download_filename(resource),
        content_disposition_type="inline",
    )


@router.get("/grades/list")
async def get_grades():
    """Get available grades"""
    return {"grades": GRADE_LEVELS}

@router.get("/subjects/list")
async def get_subjects():
    """Get available subjects"""
    return {
        "subjects": get_all_subjects(),
        "subjects_by_grade": SUBJECTS_BY_GRADE,
        "labels": SUBJECT_LABELS,
        "audio_subject": AUDIO_SUBJECT,
    }

@router.get("/categories/list")
async def get_categories():
    """Get available resource categories"""
    return {
        "categories": RESOURCE_CATEGORIES,
    }

@router.get("/", response_model=List[schemas.ResourceResponse])
async def get_resources(
    grade: Optional[int] = None,
    subject: Optional[str] = None,
    file_type: Optional[str] = None,
    category: Optional[str] = None,
    published_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get all resources with optional filtering"""
    query = db.query(models.Resource)

    if published_only:
        query = query.filter(models.Resource.is_published.is_(True))
    if grade:
        query = query.filter(models.Resource.grade_level == grade)
    if subject:
        query = query.filter(models.Resource.subject == normalize_subject(subject))
    if file_type:
        query = query.filter(models.Resource.file_type == file_type)
    if category:
        values = category_filter_values(category)
        query = query.filter(models.Resource.category.in_(values or [category]))

    return query.order_by(models.Resource.created_at.desc()).all()

@router.get("/{resource_id}", response_model=schemas.ResourceResponse)
async def get_resource(resource_id: int, db: Session = Depends(get_db)):
    """Get a specific resource by ID"""
    resource = (
        db.query(models.Resource)
        .filter(
            models.Resource.id == resource_id,
            models.Resource.is_published.is_(True),
        )
        .first()
    )
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    return resource


@router.get("/{resource_id}/download")
async def download_resource(
    resource_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    """Record a student file download and return local uploads as attachments."""
    resource = (
        db.query(models.Resource)
        .filter(
            models.Resource.id == resource_id,
            models.Resource.is_published.is_(True),
        )
        .first()
    )
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")

    target_url = resource.external_url or resource.file_path
    if not target_url:
        raise HTTPException(status_code=404, detail="Resource file not found")

    client_host = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    referrer = request.headers.get("referer")
    download = models.ResourceDownload(
        resource_id=resource.id,
        resource_title=resource.title,
        resource_grade_level=resource.grade_level,
        resource_subject=resource.subject,
        resource_category=resource.category,
        resource_file_type=resource.file_type,
        target_url=target_url,
        ip_address=client_host,
        user_agent=user_agent[:500] if user_agent else None,
        referrer=referrer[:500] if referrer else None,
    )
    db.add(download)
    db.commit()

    local_file_path = get_local_upload_path(resource.file_path)
    if local_file_path:
        return FileResponse(
            path=local_file_path,
            filename=get_download_filename(resource),
            media_type="application/octet-stream",
        )

    download_redirect_url = get_cloudinary_attachment_url(target_url) or target_url
    return RedirectResponse(url=download_redirect_url, status_code=302)


@router.get("/{resource_id}/view")
async def view_resource(resource_id: int, db: Session = Depends(get_db)):
    """Open a resource in the browser when the backing storage supports inline viewing."""
    resource = (
        db.query(models.Resource)
        .filter(
            models.Resource.id == resource_id,
            models.Resource.is_published.is_(True),
        )
        .first()
    )
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
        Path(resource.file_path or "").suffix.lower() == ".pdf"
    ):
        return get_cloudinary_raw_pdf_error_response()

    return RedirectResponse(url=target_url, status_code=302)
