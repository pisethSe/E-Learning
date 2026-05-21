from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
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

router = APIRouter(prefix="/api/resources", tags=["resources"])

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
