from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ResourceBase(BaseModel):
    title: str
    description: Optional[str] = None
    grade_level: int
    subject: str
    file_type: str
    category: Optional[str] = None
    external_url: Optional[str] = None
    is_published: bool = True


class ResourceCreate(ResourceBase):
    file_path: Optional[str] = None
    thumbnail_path: Optional[str] = None
    original_filename: Optional[str] = None
    telegram_file_id: Optional[str] = None


class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    grade_level: Optional[int] = None
    subject: Optional[str] = None
    file_type: Optional[str] = None
    category: Optional[str] = None
    external_url: Optional[str] = None
    file_path: Optional[str] = None
    thumbnail_path: Optional[str] = None
    original_filename: Optional[str] = None
    telegram_file_id: Optional[str] = None
    is_published: Optional[bool] = None


class ResourceResponse(ResourceBase):
    id: int
    file_path: Optional[str] = None
    thumbnail_path: Optional[str] = None
    original_filename: Optional[str] = None
    telegram_file_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "coming_soon"
    location: Optional[str] = None
    event_date: Optional[datetime] = None
    cta_label: Optional[str] = None
    cta_url: Optional[str] = None
    is_published: bool = True


class EventCreate(EventBase):
    image_path: Optional[str] = None


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    event_date: Optional[datetime] = None
    image_path: Optional[str] = None
    cta_label: Optional[str] = None
    cta_url: Optional[str] = None
    is_published: Optional[bool] = None


class EventResponse(EventBase):
    id: int
    image_path: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AdminStatsResponse(BaseModel):
    total_resources: int
    total_documents: int
    total_images: int
    total_audio: int
    published_resources: int
    total_events: int
    published_events: int
