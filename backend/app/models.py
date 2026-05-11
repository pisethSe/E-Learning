from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from app.database import Base


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    grade_level = Column(Integer, nullable=False)  # 9, 10, 11, 12
    subject = Column(String(100), nullable=False)
    category = Column(String(100), nullable=True)
    file_type = Column(String(50), nullable=False)  # document, image, audio
    file_path = Column(String(500), nullable=True)
    thumbnail_path = Column(String(500), nullable=True)
    original_filename = Column(String(255), nullable=True)
    external_url = Column(String(500), nullable=True)
    telegram_file_id = Column(String(200), nullable=True)
    is_published = Column(Boolean, default=True, server_default="1", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="coming_soon", server_default="coming_soon")
    location = Column(String(200), nullable=True)
    event_date = Column(DateTime(timezone=True), nullable=True)
    image_path = Column(String(500), nullable=True)
    cta_label = Column(String(120), nullable=True)
    cta_url = Column(String(500), nullable=True)
    is_published = Column(Boolean, default=True, server_default="1", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
