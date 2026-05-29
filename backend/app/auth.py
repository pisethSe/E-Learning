from datetime import datetime, timedelta, timezone
import os

import bcrypt
from fastapi import APIRouter, Depends, File, HTTPException, Request, Response, UploadFile, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.services.file_service import ADMIN_UPLOADS_DIR, remove_stored_file, store_upload_file


SECRET_KEY = os.getenv("SECRET_KEY", "change-this-secret-key")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
AUTH_COOKIE_NAME = os.getenv("AUTH_COOKIE_NAME", "grade_a_admin_token")
AUTH_COOKIE_SECURE = os.getenv("AUTH_COOKIE_SECURE", "false").lower() == "true"
AUTH_COOKIE_SAMESITE = os.getenv("AUTH_COOKIE_SAMESITE", "lax")

ADMIN_ROLE = "admin"
STUDENT_ROLE = "student"
AVATAR_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"}

router = APIRouter(prefix="/api/auth", tags=["auth"])


def normalize_email(email: str) -> str:
    return email.strip().lower()


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except ValueError:
        return False


def create_access_token(*, subject: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": subject, "exp": expires_at}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_user_by_email(db: Session, email: str):
    return (
        db.query(models.User)
        .filter(models.User.email == normalize_email(email))
        .first()
    )


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    if not user.is_active:
        return None
    return user


def parse_admin_bootstrap_accounts(raw_accounts: str):
    accounts = []
    for raw_account in raw_accounts.split(";"):
        account = raw_account.strip()
        if not account:
            continue

        parts = [part.strip() for part in account.split("|")]
        if len(parts) != 3:
            continue

        name, email, password = parts
        if not email or not password:
            continue

        accounts.append({
            "name": name or "Grade A Admin",
            "email": email,
            "password": password,
        })

    return accounts


def get_admin_bootstrap_accounts():
    bootstrap_accounts = parse_admin_bootstrap_accounts(os.getenv("ADMIN_BOOTSTRAP_ACCOUNTS", ""))
    if bootstrap_accounts:
        return bootstrap_accounts

    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")
    admin_name = os.getenv("ADMIN_NAME", "Grade A Admin")

    if not admin_email or not admin_password:
        return []

    return [{
        "name": admin_name,
        "email": admin_email,
        "password": admin_password,
    }]


def set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key=AUTH_COOKIE_NAME,
        value=token,
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True,
        secure=AUTH_COOKIE_SECURE,
        samesite=AUTH_COOKIE_SAMESITE,
    )


def clear_auth_cookie(response: Response):
    response.delete_cookie(
        key=AUTH_COOKIE_NAME,
        httponly=True,
        secure=AUTH_COOKIE_SECURE,
        samesite=AUTH_COOKIE_SAMESITE,
    )


def extract_token(request: Request) -> str | None:
    cookie_token = request.cookies.get(AUTH_COOKIE_NAME)
    if cookie_token:
        return cookie_token

    authorization = request.headers.get("Authorization", "")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() == "bearer" and token:
        return token

    return None


async def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required",
    )

    token = extract_token(request)
    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        subject = payload.get("sub")
    except JWTError as exc:
        raise credentials_exception from exc

    if not subject:
        raise credentials_exception

    try:
        user_id = int(subject)
    except (TypeError, ValueError) as exc:
        raise credentials_exception from exc

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or not user.is_active:
        raise credentials_exception

    return user


async def require_admin(current_user: models.User = Depends(get_current_user)):
    if current_user.role != ADMIN_ROLE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )

    return current_user


def ensure_default_admin(db: Session):
    for account in get_admin_bootstrap_accounts():
        normalized_email = normalize_email(account["email"])
        existing_admin = get_user_by_email(db, normalized_email)
        if existing_admin:
            continue

        admin = models.User(
            name=account["name"],
            email=normalized_email,
            hashed_password=hash_password(account["password"]),
            role=ADMIN_ROLE,
            is_active=True,
        )
        db.add(admin)

    db.commit()


@router.post("/login", response_model=schemas.AuthResponse)
async def login_admin(
    credentials: schemas.AdminLoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    user = authenticate_user(db, credentials.email, credentials.password)
    if not user or user.role != ADMIN_ROLE:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin email or password",
        )

    token = create_access_token(subject=str(user.id))
    set_auth_cookie(response, token)
    return {"user": user}


@router.get("/me", response_model=schemas.UserResponse)
async def read_current_user(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=schemas.UserResponse)
async def update_current_user(
    payload: schemas.AdminProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    next_name = (payload.name or "").strip()
    next_email = normalize_email(payload.email or current_user.email)
    wants_email_change = next_email != current_user.email
    wants_password_change = bool(payload.new_password)

    if not next_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Display name is required",
        )

    if "@" not in next_email or "." not in next_email.rsplit("@", 1)[-1]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Enter a valid admin email address",
        )

    if wants_email_change or wants_password_change:
        if not payload.current_password or not verify_password(
            payload.current_password,
            current_user.hashed_password,
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is required for email or password changes",
            )

    if wants_password_change and len(payload.new_password or "") < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters",
        )

    if wants_email_change:
        existing_user = get_user_by_email(db, next_email)
        if existing_user and existing_user.id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="That admin email is already in use",
            )

    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin user not found",
        )

    user.name = next_name
    user.email = next_email
    if wants_password_change:
        user.hashed_password = hash_password(payload.new_password or "")

    db.commit()
    db.refresh(user)
    return user


@router.post("/me/avatar", response_model=schemas.UserResponse)
async def update_current_user_avatar(
    avatar: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content_type = (avatar.content_type or "").lower()
    if content_type not in AVATAR_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile photo must be a JPG, PNG, WebP, GIF, or AVIF image",
        )

    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin user not found",
        )

    previous_avatar_path = user.avatar_path
    previous_cloudinary_public_id = user.avatar_cloudinary_public_id
    previous_cloudinary_resource_type = user.avatar_cloudinary_resource_type
    stored_avatar = store_upload_file(
        upload_file=avatar,
        destination_dir=ADMIN_UPLOADS_DIR,
        preferred_name=f"admin-{user.id}-profile-photo",
        file_type_hint="image",
    )

    user.avatar_path = stored_avatar["file_path"]
    user.avatar_cloudinary_public_id = stored_avatar["cloudinary_public_id"]
    user.avatar_cloudinary_resource_type = stored_avatar["cloudinary_resource_type"]
    db.commit()
    db.refresh(user)

    remove_stored_file(
        previous_avatar_path,
        cloudinary_public_id=previous_cloudinary_public_id,
        cloudinary_resource_type=previous_cloudinary_resource_type,
    )
    return user


@router.delete("/me/avatar", response_model=schemas.UserResponse)
async def delete_current_user_avatar(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin user not found",
        )

    previous_avatar_path = user.avatar_path
    previous_cloudinary_public_id = user.avatar_cloudinary_public_id
    previous_cloudinary_resource_type = user.avatar_cloudinary_resource_type

    user.avatar_path = None
    user.avatar_cloudinary_public_id = None
    user.avatar_cloudinary_resource_type = None
    db.commit()
    db.refresh(user)

    remove_stored_file(
        previous_avatar_path,
        cloudinary_public_id=previous_cloudinary_public_id,
        cloudinary_resource_type=previous_cloudinary_resource_type,
    )
    return user


@router.post("/logout")
async def logout(response: Response):
    clear_auth_cookie(response)
    return {"message": "Signed out successfully"}
