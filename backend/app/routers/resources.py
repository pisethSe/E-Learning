from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/resources", tags=["resources"])

@router.get("/grades/list")
async def get_grades():
    """Get available grades"""
    return {"grades": [9, 10, 11, 12]}

@router.get("/subjects/list")
async def get_subjects():
    """Get available subjects"""
    return {
        "subjects": [
            "Mathematics", "Physics", "Chemistry", "Biology",
            "Khmer Literature", "History", "Geography", "English"
        ]
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
        query = query.filter(models.Resource.subject == subject)
    if file_type:
        query = query.filter(models.Resource.file_type == file_type)
    if category:
        query = query.filter(models.Resource.category == category)

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
