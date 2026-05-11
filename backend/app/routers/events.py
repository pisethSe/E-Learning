from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("/", response_model=List[schemas.EventResponse])
async def get_events(
    status: Optional[str] = None,
    published_only: bool = True,
    db: Session = Depends(get_db),
):
    query = db.query(models.Event)

    if published_only:
        query = query.filter(models.Event.is_published.is_(True))
    if status:
        query = query.filter(models.Event.status == status)

    return query.order_by(models.Event.event_date.asc(), models.Event.created_at.desc()).all()


@router.get("/{event_id}", response_model=schemas.EventResponse)
async def get_event(event_id: int, db: Session = Depends(get_db)):
    event = (
        db.query(models.Event)
        .filter(models.Event.id == event_id, models.Event.is_published.is_(True))
        .first()
    )
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
