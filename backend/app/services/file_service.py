import mimetypes
import re
import secrets
import shutil
from pathlib import Path
from typing import Optional

from telegram import Bot

try:
    from PIL import Image
except ImportError:  # pragma: no cover - optional dependency
    Image = None

BASE_DIR = Path(__file__).resolve().parents[2]
UPLOADS_DIR = BASE_DIR / "uploads"
RESOURCE_UPLOADS_DIR = UPLOADS_DIR / "resources"
EVENT_UPLOADS_DIR = UPLOADS_DIR / "events"
THUMBNAILS_DIR = UPLOADS_DIR / "thumbnails"


def ensure_storage_dirs():
    RESOURCE_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    EVENT_UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)


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


def is_image_path(value: Optional[str]) -> bool:
    return Path(value or "").suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def store_upload_file(
    *,
    upload_file,
    destination_dir: Path,
    preferred_name: Optional[str] = None,
):
    ensure_storage_dirs()

    original_name = upload_file.filename or preferred_name or "upload"
    file_extension = guess_extension(original_name, None)
    safe_stem = sanitize_filename(Path(preferred_name or original_name).stem)
    unique_name = f"{safe_stem}-{secrets.token_hex(8)}{file_extension}"
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
    }


def remove_public_file(public_path: Optional[str]):
    if not public_path or not public_path.startswith("/uploads/"):
        return

    relative_path = public_path.removeprefix("/uploads/").strip("/")
    target_path = UPLOADS_DIR / relative_path
    if target_path.exists() and target_path.is_file():
        target_path.unlink()


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

    thumbnail_public_path = None
    if file_extension.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
        thumbnail_name = f"{Path(unique_name).stem}-thumb.jpg"
        thumbnail_public_path = create_thumbnail(local_file_path, thumbnail_name)

    return {
        "file_path": build_public_path(UPLOADS_DIR, local_file_path),
        "thumbnail_path": thumbnail_public_path,
        "telegram_file_path": telegram_file.file_path,
    }
