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
    file_hash: Optional[str] = None
    telegram_file_id: Optional[str] = None
    cloudinary_public_id: Optional[str] = None
    cloudinary_resource_type: Optional[str] = None
    thumbnail_cloudinary_public_id: Optional[str] = None
    thumbnail_cloudinary_resource_type: Optional[str] = None


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
    file_hash: Optional[str] = None
    telegram_file_id: Optional[str] = None
    cloudinary_public_id: Optional[str] = None
    cloudinary_resource_type: Optional[str] = None
    thumbnail_cloudinary_public_id: Optional[str] = None
    thumbnail_cloudinary_resource_type: Optional[str] = None
    is_published: Optional[bool] = None


class ResourceResponse(ResourceBase):
    id: int
    file_path: Optional[str] = None
    thumbnail_path: Optional[str] = None
    original_filename: Optional[str] = None
    file_hash: Optional[str] = None
    telegram_file_id: Optional[str] = None
    cloudinary_public_id: Optional[str] = None
    cloudinary_resource_type: Optional[str] = None
    thumbnail_cloudinary_public_id: Optional[str] = None
    thumbnail_cloudinary_resource_type: Optional[str] = None
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
    media_type: Optional[str] = "video"
    cta_label: Optional[str] = None
    cta_url: Optional[str] = None
    is_published: bool = True


class EventCreate(EventBase):
    image_path: Optional[str] = None
    media_path: Optional[str] = None
    cloudinary_public_id: Optional[str] = None
    cloudinary_resource_type: Optional[str] = None


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    location: Optional[str] = None
    event_date: Optional[datetime] = None
    image_path: Optional[str] = None
    media_path: Optional[str] = None
    media_type: Optional[str] = None
    cloudinary_public_id: Optional[str] = None
    cloudinary_resource_type: Optional[str] = None
    cta_label: Optional[str] = None
    cta_url: Optional[str] = None
    is_published: Optional[bool] = None


class EventResponse(EventBase):
    id: int
    image_path: Optional[str] = None
    media_path: Optional[str] = None
    cloudinary_public_id: Optional[str] = None
    cloudinary_resource_type: Optional[str] = None
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
    total_downloads: int
    downloads_today: int


class DownloadLogResponse(BaseModel):
    id: int
    resource_id: int
    resource_title: str
    resource_grade_level: Optional[int] = None
    resource_subject: Optional[str] = None
    resource_category: Optional[str] = None
    resource_file_type: Optional[str] = None
    target_url: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    referrer: Optional[str] = None
    downloaded_at: datetime

    class Config:
        from_attributes = True


class AdminLoginRequest(BaseModel):
    email: str
    password: str


class AdminProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None


class AdminNotificationSettings(BaseModel):
    email: bool = True
    push: bool = False
    updates: bool = True


class AdminAppearanceSettings(BaseModel):
    theme: str = "light"
    density: str = "comfortable"


class AdminSettingsResponse(BaseModel):
    notifications: AdminNotificationSettings
    appearance: AdminAppearanceSettings


class AdminSettingsUpdate(BaseModel):
    notifications: Optional[AdminNotificationSettings] = None
    appearance: Optional[AdminAppearanceSettings] = None


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    avatar_path: Optional[str] = None
    role: str
    is_active: bool

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    user: UserResponse
