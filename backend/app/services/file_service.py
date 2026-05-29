import mimetypes
import os
import re
import secrets
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import HTTPException
from telegram import Bot

try:
    from PIL import Image, ImageOps
except ImportError:  # pragma: no cover - optional dependency
    Image = None
    ImageOps = None

BASE_DIR = Path(__file__).resolve().parents[2]
UPLOADS_DIR = BASE_DIR / "uploads"
RESOURCE_UPLOADS_DIR = UPLOADS_DIR / "resources"
EVENT_UPLOADS_DIR = UPLOADS_DIR / "events"
ADMIN_UPLOADS_DIR = UPLOADS_DIR / "admin"
THUMBNAILS_DIR = UPLOADS_DIR / "thumbnails"
CLOUDINARY_DEFAULT_FOLDER = "e-learning-grade-a"
CLOUDINARY_LARGE_UPLOAD_THRESHOLD = 95 * 1024 * 1024
CLOUDINARY_LARGE_UPLOAD_CHUNK_SIZE = 20 * 1024 * 1024


def ensure_storage_dirs():
    RESOURCE_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    EVENT_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    ADMIN_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)


def get_storage_backend() -> str:
    configured_backend = os.getenv("STORAGE_BACKEND", "").strip().lower()
    if configured_backend:
        return configured_backend

    cloudinary_credentials = [
        os.getenv("CLOUDINARY_URL"),
        os.getenv("CLOUDINARY_CLOUD_NAME"),
        os.getenv("CLOUDINARY_API_KEY"),
        os.getenv("CLOUDINARY_API_SECRET"),
    ]
    return "cloudinary" if any(cloudinary_credentials) else "local"


def using_cloudinary_storage() -> bool:
    return get_storage_backend() == "cloudinary"


def should_store_locally_when_cloudinary(
    *,
    filename: Optional[str] = None,
    file_type_hint: Optional[str] = None,
    content_type: Optional[str] = None,
) -> bool:
    hint = (file_type_hint or "").strip().lower()
    normalized_content_type = (content_type or "").lower()
    extension = Path(filename or "").suffix.lower()

    if hint in {"document", "file", "pdf"}:
        return True

    return normalized_content_type == "application/pdf" or extension == ".pdf"


def sanitize_filename(filename: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "-", filename).strip("-.")
    return cleaned or "telegram-file"


def guess_extension(filename: Optional[str], telegram_path: Optional[str]) -> str:
    for candidate in [filename, telegram_path]:
        if candidate:
            suffix = Path(candidate).suffix
            if suffix:
                return suffix.lower()

    guessed_extension = mimetypes.guess_extension("application/octet-stream")
    return guessed_extension or ".bin"


def build_public_path(base_dir: Path, file_path: Path) -> str:
    relative_path = file_path.relative_to(base_dir)
    return f"/uploads/{relative_path.as_posix()}"


def create_thumbnail(source_path: Path, output_name: str) -> Optional[str]:
    if Image is None:
        return None

    ensure_storage_dirs()
    thumbnail_path = THUMBNAILS_DIR / output_name

    with Image.open(source_path) as image:
        image.thumbnail((480, 480))
        if image.mode != "RGB":
            image = image.convert("RGB")
        image.save(thumbnail_path, optimize=True)

    return build_public_path(UPLOADS_DIR, thumbnail_path)


def save_thumbnail_image(image, output_name: str) -> Optional[str]:
    if Image is None:
        return None

    ensure_storage_dirs()
    thumbnail_path = THUMBNAILS_DIR / output_name
    thumbnail = image.copy()
    thumbnail.thumbnail((480, 480))
    if thumbnail.mode != "RGB":
        thumbnail = thumbnail.convert("RGB")
    thumbnail.save(thumbnail_path, optimize=True)

    return build_public_path(UPLOADS_DIR, thumbnail_path)


def is_image_path(value: Optional[str]) -> bool:
    return Path(value or "").suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}


def is_video_path(value: Optional[str]) -> bool:
    return Path(value or "").suffix.lower() in {".mp4", ".webm", ".mov", ".m4v", ".ogg"}


def is_audio_path(value: Optional[str]) -> bool:
    return Path(value or "").suffix.lower() in {".mp3", ".wav", ".m4a", ".aac", ".ogg"}


def convert_upload_image_for_pdf(upload_file):
    if Image is None or ImageOps is None:
        raise HTTPException(
            status_code=500,
            detail="Pillow is required to combine image uploads into one PDF.",
        )

    upload_file.file.seek(0)
    with Image.open(upload_file.file) as opened_image:
        image = ImageOps.exif_transpose(opened_image)
        if image.mode in {"RGBA", "LA"} or (
            image.mode == "P" and "transparency" in image.info
        ):
            background = Image.new("RGB", image.size, "white")
            alpha = image.convert("RGBA").getchannel("A")
            background.paste(image.convert("RGBA"), mask=alpha)
            converted_image = background
        else:
            converted_image = image.convert("RGB")
        converted_image.load()

    upload_file.file.seek(0)
    return converted_image


def store_image_uploads_as_pdf(
    *,
    upload_files,
    destination_dir: Path,
    preferred_name: Optional[str] = None,
):
    ensure_storage_dirs()

    images = [convert_upload_image_for_pdf(upload_file) for upload_file in upload_files]
    if not images:
        raise HTTPException(status_code=400, detail="Provide at least one image upload")

    safe_stem = sanitize_filename(Path(preferred_name or "image-upload").stem)
    unique_name = f"{safe_stem}-{secrets.token_hex(8)}.pdf"
    local_file_path = destination_dir / unique_name
    first_image, *remaining_images = images
    first_image.save(
        local_file_path,
        "PDF",
        save_all=True,
        append_images=remaining_images,
        resolution=100.0,
    )

    thumbnail_name = f"{Path(unique_name).stem}-thumb.jpg"
    thumbnail_public_path = save_thumbnail_image(first_image, thumbnail_name)
    return {
        "file_path": build_public_path(UPLOADS_DIR, local_file_path),
        "thumbnail_path": thumbnail_public_path,
        "original_filename": f"{safe_stem}.pdf",
        "cloudinary_public_id": None,
        "cloudinary_resource_type": None,
    }


def get_cloudinary_folder(destination_dir: Path) -> str:
    base_folder = os.getenv("CLOUDINARY_UPLOAD_FOLDER", CLOUDINARY_DEFAULT_FOLDER).strip("/")
    if destination_dir == EVENT_UPLOADS_DIR:
        return f"{base_folder}/events"
    if destination_dir == ADMIN_UPLOADS_DIR:
        return f"{base_folder}/admin"
    return f"{base_folder}/resources"


def get_cloudinary_resource_type(
    *,
    filename: Optional[str] = None,
    content_type: Optional[str] = None,
    file_type_hint: Optional[str] = None,
) -> str:
    hint = (file_type_hint or "").strip().lower()
    normalized_content_type = (content_type or "").lower()

    if hint == "audio" or normalized_content_type.startswith("audio/") or is_audio_path(filename):
        return "video"
    if hint == "video" or normalized_content_type.startswith("video/") or is_video_path(filename):
        return "video"
    if hint == "image" or normalized_content_type.startswith("image/") or is_image_path(filename):
        return "image"

    return "raw"


def configure_cloudinary():
    try:
        import cloudinary
    except ImportError as exc:  # pragma: no cover - dependency/runtime configuration
        raise HTTPException(
            status_code=500,
            detail="Cloudinary storage is enabled, but the cloudinary Python package is not installed.",
        ) from exc

    if os.getenv("CLOUDINARY_URL"):
        cloudinary.config(secure=True)
        return

    missing_keys = [
        key
        for key in [
            "CLOUDINARY_CLOUD_NAME",
            "CLOUDINARY_API_KEY",
            "CLOUDINARY_API_SECRET",
        ]
        if not os.getenv(key)
    ]

    if missing_keys:
        raise HTTPException(
            status_code=500,
            detail=f"Cloudinary storage is enabled, but {', '.join(missing_keys)} is not configured.",
        )

    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
        secure=True,
    )


def upload_path_to_cloudinary(
    *,
    local_file_path: Path,
    original_name: str,
    destination_dir: Path,
    file_type_hint: Optional[str] = None,
    content_type: Optional[str] = None,
):
    configure_cloudinary()

    import cloudinary.uploader

    resource_type = get_cloudinary_resource_type(
        filename=original_name,
        content_type=content_type,
        file_type_hint=file_type_hint,
    )

    if (
        resource_type == "video"
        and (file_type_hint or "").strip().lower() == "audio"
        and local_file_path.stat().st_size >= CLOUDINARY_LARGE_UPLOAD_THRESHOLD
    ):
        local_file_path = compress_audio_for_cloudinary(local_file_path)

    upload_options = {
        "folder": get_cloudinary_folder(destination_dir),
        "resource_type": resource_type,
        "use_filename": True,
        "unique_filename": True,
        "overwrite": False,
    }

    try:
        if local_file_path.stat().st_size >= CLOUDINARY_LARGE_UPLOAD_THRESHOLD:
            upload_result = cloudinary.uploader.upload_large(
                str(local_file_path),
                chunk_size=CLOUDINARY_LARGE_UPLOAD_CHUNK_SIZE,
                **upload_options,
            )
        else:
            upload_result = cloudinary.uploader.upload(
                str(local_file_path),
                **upload_options,
            )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Cloudinary upload failed: {exc}",
        ) from exc
    secure_url = upload_result.get("secure_url") or upload_result.get("url")
    cloudinary_resource_type = upload_result.get("resource_type") or resource_type

    if not secure_url:
        raise HTTPException(status_code=502, detail="Cloudinary upload did not return a file URL.")

    return {
        "file_path": secure_url,
        "thumbnail_path": secure_url if cloudinary_resource_type == "image" else None,
        "original_filename": original_name,
        "cloudinary_public_id": upload_result.get("public_id"),
        "cloudinary_resource_type": cloudinary_resource_type,
    }


def compress_audio_for_cloudinary(local_file_path: Path) -> Path:
    try:
        import imageio_ffmpeg
    except ImportError as exc:  # pragma: no cover - dependency/runtime configuration
        raise HTTPException(
            status_code=500,
            detail="Audio is too large for Cloudinary and imageio-ffmpeg is not installed for compression.",
        ) from exc

    compressed_path = local_file_path.with_name(f"{local_file_path.stem}-compressed.m4a")
    ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()
    result = subprocess.run(
        [
            ffmpeg_path,
            "-y",
            "-i",
            str(local_file_path),
            "-vn",
            "-ac",
            "1",
            "-ar",
            "22050",
            "-c:a",
            "aac",
            "-b:a",
            "32k",
            "-movflags",
            "+faststart",
            str(compressed_path),
        ],
        capture_output=True,
    )

    if result.returncode != 0 or not compressed_path.exists():
        stderr = result.stderr[-4000:].decode("utf-8", "replace")
        raise HTTPException(
            status_code=502,
            detail=f"Audio compression failed before Cloudinary upload: {stderr}",
        )

    return compressed_path


def store_upload_file(
    *,
    upload_file,
    destination_dir: Path,
    preferred_name: Optional[str] = None,
    file_type_hint: Optional[str] = None,
):
    ensure_storage_dirs()

    original_name = upload_file.filename or preferred_name or "upload"
    file_extension = guess_extension(original_name, None)
    safe_stem = sanitize_filename(Path(preferred_name or original_name).stem)
    unique_name = f"{safe_stem}-{secrets.token_hex(8)}{file_extension}"

    content_type = getattr(upload_file, "content_type", None)

    if using_cloudinary_storage() and not should_store_locally_when_cloudinary(
        filename=original_name,
        file_type_hint=file_type_hint,
        content_type=content_type,
    ):
        with tempfile.TemporaryDirectory() as temp_dir:
            local_file_path = Path(temp_dir) / unique_name
            with local_file_path.open("wb") as buffer:
                shutil.copyfileobj(upload_file.file, buffer)

            return upload_path_to_cloudinary(
                local_file_path=local_file_path,
                original_name=original_name,
                destination_dir=destination_dir,
                file_type_hint=file_type_hint,
                content_type=content_type,
            )

    local_file_path = destination_dir / unique_name

    with local_file_path.open("wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    thumbnail_public_path = None
    if is_image_path(local_file_path.name):
        thumbnail_name = f"{Path(unique_name).stem}-thumb.jpg"
        thumbnail_public_path = create_thumbnail(local_file_path, thumbnail_name)

    return {
        "file_path": build_public_path(UPLOADS_DIR, local_file_path),
        "thumbnail_path": thumbnail_public_path,
        "original_filename": original_name,
        "cloudinary_public_id": None,
        "cloudinary_resource_type": None,
    }


def remove_public_file(public_path: Optional[str]):
    if not public_path or not public_path.startswith("/uploads/"):
        return

    relative_path = public_path.removeprefix("/uploads/").strip("/")
    target_path = UPLOADS_DIR / relative_path
    if target_path.exists() and target_path.is_file():
        target_path.unlink()


def remove_cloudinary_file(
    *,
    public_id: Optional[str],
    resource_type: Optional[str],
):
    if not public_id:
        return

    configure_cloudinary()

    import cloudinary.uploader

    cloudinary.uploader.destroy(
        public_id,
        resource_type=resource_type or "image",
        invalidate=True,
    )


def remove_stored_file(
    public_path: Optional[str],
    *,
    cloudinary_public_id: Optional[str] = None,
    cloudinary_resource_type: Optional[str] = None,
):
    if cloudinary_public_id:
        remove_cloudinary_file(
            public_id=cloudinary_public_id,
            resource_type=cloudinary_resource_type,
        )
        return

    remove_public_file(public_path)


async def download_telegram_file_to_storage(
    *,
    bot_token: str,
    telegram_file_id: str,
    preferred_name: Optional[str] = None,
):
    ensure_storage_dirs()

    bot = Bot(token=bot_token)
    telegram_file = await bot.get_file(telegram_file_id)

    original_name = preferred_name or Path(telegram_file.file_path or "").name
    file_extension = guess_extension(original_name, telegram_file.file_path)
    safe_stem = sanitize_filename(Path(original_name or "telegram-file").stem)
    unique_name = f"{safe_stem}-{secrets.token_hex(8)}{file_extension}"

    local_file_path = RESOURCE_UPLOADS_DIR / unique_name
    await telegram_file.download_to_drive(custom_path=str(local_file_path))

    if using_cloudinary_storage():
        try:
            return upload_path_to_cloudinary(
                local_file_path=local_file_path,
                original_name=original_name,
                destination_dir=RESOURCE_UPLOADS_DIR,
                file_type_hint=None,
            )
        finally:
            if local_file_path.exists():
                local_file_path.unlink()

    thumbnail_public_path = None
    if file_extension.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
        thumbnail_name = f"{Path(unique_name).stem}-thumb.jpg"
        thumbnail_public_path = create_thumbnail(local_file_path, thumbnail_name)

    return {
        "file_path": build_public_path(UPLOADS_DIR, local_file_path),
        "thumbnail_path": thumbnail_public_path,
        "original_filename": original_name,
        "telegram_file_path": telegram_file.file_path,
        "cloudinary_public_id": None,
        "cloudinary_resource_type": None,
    }
