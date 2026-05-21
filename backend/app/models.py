from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), index=True, nullable=False, default="student", server_default="student")
    is_active = Column(Boolean, index=True, default=True, server_default="1", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    grade_level = Column(Integer, index=True, nullable=False)  # 9, 10, 11, 12
    subject = Column(String(100), index=True, nullable=False)
    category = Column(String(100), index=True, nullable=True)
    file_type = Column(String(50), index=True, nullable=False)  # document, image, audio
    file_path = Column(String(500), nullable=True)
    thumbnail_path = Column(String(500), nullable=True)
    original_filename = Column(String(255), nullable=True)
    external_url = Column(String(500), nullable=True)
    telegram_file_id = Column(String(200), nullable=True)
    cloudinary_public_id = Column(String(500), nullable=True)
    cloudinary_resource_type = Column(String(50), nullable=True)
    is_published = Column(Boolean, index=True, default=True, server_default="1", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), index=True, nullable=False, default="coming_soon", server_default="coming_soon")
    location = Column(String(200), nullable=True)
    event_date = Column(DateTime(timezone=True), nullable=True)
    image_path = Column(String(500), nullable=True)
    media_path = Column(String(500), nullable=True)
    media_type = Column(String(50), index=True, nullable=False, default="video", server_default="video")
    cloudinary_public_id = Column(String(500), nullable=True)
    cloudinary_resource_type = Column(String(50), nullable=True)
    cta_label = Column(String(120), nullable=True)
    cta_url = Column(String(500), nullable=True)
    is_published = Column(Boolean, index=True, default=True, server_default="1", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
