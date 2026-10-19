"""Unit/integration tests for the E-Learning API.

Runs against an isolated SQLite database and local file storage
(see conftest.py) so production Neon/Cloudinary data is untouched,
with one explicit end-to-end Cloudinary round-trip test that mirrors
the production storage path.
"""

import io
import os
import re

import pytest

from conftest import make_pdf_bytes, make_png_bytes


# ---------------------------------------------------------------------------
# Public, unauthenticated endpoints
# ---------------------------------------------------------------------------


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "online"
    assert body["storage_backend"] == "local"


def test_api_docs_available_locally(client):
    response = client.get("/docs")
    assert response.status_code == 200


def test_catalog_lists(client):
    grades = client.get("/api/resources/grades/list")
    assert grades.status_code == 200
    assert grades.json()["grades"] == [9, 10, 11, 12]

    subjects = client.get("/api/resources/subjects/list")
    assert subjects.status_code == 200
    assert "Mathematics" in subjects.json()["subjects"]

    categories = client.get("/api/resources/categories/list")
    assert categories.status_code == 200
    category_ids = {c["id"] for c in categories.json()["categories"]}
    assert category_ids == {
        "exercise_solution",
        "formula",
        "exam_paper",
        "document",
        "ebook",
    }


def test_events_list(client):
    response = client.get("/api/events/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_missing_resource_returns_404(client):
    response = client.get("/api/resources/999999")
    assert response.status_code == 404


def test_static_uploads_mounted(client):
    response = client.get("/uploads/")
    # Directory listing is disabled; anything but a server error is fine.
    assert response.status_code < 500


# ---------------------------------------------------------------------------
# Authentication and authorization
# ---------------------------------------------------------------------------


def test_login_rejects_wrong_password(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "pytest-admin@test.local", "password": "wrong-password"},
    )
    assert response.status_code == 401


def test_login_rejects_unknown_email(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "nobody@test.local", "password": "whatever"},
    )
    assert response.status_code == 401


def test_me_requires_auth(client):
    assert client.get("/api/auth/me").status_code == 401


def test_admin_endpoints_require_auth(client):
    for path in ("/api/admin/stats", "/api/admin/resources", "/api/admin/events"):
        assert client.get(path).status_code in (401, 403), path


def test_admin_login_and_me(admin_client):
    me = admin_client.get("/api/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == "pytest-admin@test.local"
    assert me.json()["role"] == "admin"


def test_logout_clears_session(admin_client):
    response = admin_client.post("/api/auth/logout")
    assert response.status_code == 200
    assert admin_client.get("/api/auth/me").status_code == 401
    # log back in for the remaining tests
    login = admin_client.post(
        "/api/auth/login",
        json={
            "email": "pytest-admin@test.local",
            "password": "pytest-password-123",
        },
    )
    assert login.status_code == 200


# ---------------------------------------------------------------------------
# Admin data endpoints
# ---------------------------------------------------------------------------


def test_admin_stats_shape(admin_client):
    response = admin_client.get("/api/admin/stats")
    assert response.status_code == 200
    body = response.json()
    assert "total_resources" in body
    assert "published_resources" in body


def test_admin_downloads_list(admin_client):
    response = admin_client.get("/api/admin/downloads")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_admin_settings_roundtrip(admin_client):
    response = admin_client.get("/api/admin/settings")
    assert response.status_code == 200


def test_admin_backup_is_zip(admin_client):
    response = admin_client.get("/api/admin/backup")
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/zip")


# ---------------------------------------------------------------------------
# Resource CRUD (isolated database + local storage)
# ---------------------------------------------------------------------------


def _upload_document(admin_client, title, filename="pytest-doc.pdf", content=None):
    file_bytes = io.BytesIO(content if content is not None else make_pdf_bytes(title))
    return admin_client.post(
        "/api/admin/resources/upload",
        data={
            "title": title,
            "grade_level": "12",
            "subject": "Mathematics",
            "file_type": "document",
            "category": "formula",
            "is_published": "true",
        },
        files={"file": (filename, file_bytes, "application/pdf")},
    )


def test_resource_crud_cycle(admin_client):
    created = _upload_document(admin_client, "Pytest Formula Sheet")
    assert created.status_code == 200, created.text
    resource = created.json()
    resource_id = resource["id"]
    assert resource["file_path"].startswith("/uploads/")
    assert resource["is_published"] is True

    try:
        # visible on the public website
        public_list = admin_client.get("/api/resources/")
        assert any(r["id"] == resource_id for r in public_list.json())

        # filter by subject
        filtered = admin_client.get("/api/resources/", params={"subject": "Mathematics"})
        assert any(r["id"] == resource_id for r in filtered.json())

        # single fetch + view + download
        single = admin_client.get(f"/api/resources/{resource_id}")
        assert single.status_code == 200
        assert single.json()["title"] == "Pytest Formula Sheet"

        view = admin_client.get(f"/api/resources/{resource_id}/view")
        assert view.status_code == 200

        download = admin_client.get(f"/api/resources/{resource_id}/download")
        assert download.status_code == 200

        # update
        updated = admin_client.put(
            f"/api/admin/resources/{resource_id}",
            data={
                "title": "Pytest Formula Sheet v2",
                "grade_level": "12",
                "subject": "Mathematics",
                "file_type": "document",
                "category": "formula",
                "is_published": "true",
            },
        )
        assert updated.status_code == 200, updated.text
        assert updated.json()["title"] == "Pytest Formula Sheet v2"

        # unpublish -> disappears from public site
        unpublished = admin_client.put(
            f"/api/admin/resources/{resource_id}",
            data={
                "title": "Pytest Formula Sheet v2",
                "grade_level": "12",
                "subject": "Mathematics",
                "file_type": "document",
                "category": "formula",
                "is_published": "false",
            },
        )
        assert unpublished.status_code == 200
        public_after = admin_client.get("/api/resources/")
        assert not any(r["id"] == resource_id for r in public_after.json())
    finally:
        deleted = admin_client.delete(f"/api/admin/resources/{resource_id}")
        assert deleted.status_code == 200

    assert admin_client.get(f"/api/resources/{resource_id}").status_code == 404


def test_duplicate_upload_rejected(admin_client):
    first = _upload_document(admin_client, "Pytest Duplicate Check")
    assert first.status_code == 200
    resource_id = first.json()["id"]

    try:
        second = _upload_document(admin_client, "Pytest Duplicate Check")
        assert second.status_code == 409
        assert "Duplicate" in second.json()["detail"]
    finally:
        admin_client.delete(f"/api/admin/resources/{resource_id}")


def test_upload_validation_errors(admin_client):
    base_data = {
        "title": "Pytest Invalid",
        "grade_level": "12",
        "subject": "Mathematics",
        "file_type": "document",
    }
    pdf = ("pytest-invalid.pdf", make_pdf_bytes(), "application/pdf")

    # invalid grade
    response = admin_client.post(
        "/api/admin/resources/upload",
        data={**base_data, "grade_level": "13"},
        files={"file": pdf},
    )
    assert response.status_code == 400

    # invalid subject
    response = admin_client.post(
        "/api/admin/resources/upload",
        data={**base_data, "subject": "Nonexistent Subject"},
        files={"file": pdf},
    )
    assert response.status_code == 400

    # invalid category
    response = admin_client.post(
        "/api/admin/resources/upload",
        data={**base_data, "category": "not-a-category"},
        files={"file": pdf},
    )
    assert response.status_code == 400

    # invalid file_type
    response = admin_client.post(
        "/api/admin/resources/upload",
        data={**base_data, "file_type": "hologram"},
        files={"file": pdf},
    )
    assert response.status_code == 400

    # no file and no external_url
    response = admin_client.post("/api/admin/resources/upload", data=base_data)
    assert response.status_code == 400


def test_audio_must_use_khmer_literature(admin_client):
    response = admin_client.post(
        "/api/admin/resources/upload",
        data={
            "title": "Pytest Audio Wrong Subject",
            "grade_level": "12",
            "subject": "Mathematics",
            "file_type": "audio",
        },
        files={"file": ("pytest-audio.m4a", b"\x00\x00\x00 ftypM4A", "audio/mp4")},
    )
    assert response.status_code == 400
    assert "Khmer Literature" in response.json()["detail"]


def test_image_upload_creates_thumbnail(admin_client):
    created = admin_client.post(
        "/api/admin/resources/upload",
        data={
            "title": "Pytest Formula Photo",
            "grade_level": "12",
            "subject": "Physics",
            "file_type": "image",
            "category": "formula",
            "is_published": "true",
        },
        files={"file": ("pytest-photo.png", make_png_bytes(), "image/png")},
    )
    assert created.status_code == 200, created.text
    resource = created.json()
    resource_id = resource["id"]

    try:
        assert resource["file_type"] == "image"
        assert resource["thumbnail_path"] is not None
        thumbnail_response = admin_client.get(resource["thumbnail_path"])
        assert thumbnail_response.status_code == 200
        assert thumbnail_response.headers["content-type"].startswith("image/")
    finally:
        admin_client.delete(f"/api/admin/resources/{resource_id}")


def test_multiple_images_become_one_pdf(admin_client):
    created = admin_client.post(
        "/api/admin/resources/upload",
        data={
            "title": "Pytest Image Bundle",
            "grade_level": "12",
            "subject": "Chemistry",
            "file_type": "image",
            "is_published": "true",
        },
        files=[
            ("file", ("page1.png", make_png_bytes((200, 0, 0)), "image/png")),
            ("file", ("page2.png", make_png_bytes((0, 200, 0)), "image/png")),
        ],
    )
    assert created.status_code == 200, created.text
    resource = created.json()
    resource_id = resource["id"]

    try:
        assert resource["original_filename"].endswith(".pdf")
        assert resource["file_path"].startswith("/uploads/resources/")
    finally:
        admin_client.delete(f"/api/admin/resources/{resource_id}")


def test_external_url_resource(admin_client):
    created = admin_client.post(
        "/api/admin/resources/upload",
        data={
            "title": "Pytest External Link",
            "grade_level": "12",
            "subject": "Biology",
            "file_type": "document",
            "external_url": "https://example.com/study-guide",
            "is_published": "true",
        },
    )
    assert created.status_code == 200, created.text
    resource = created.json()
    resource_id = resource["id"]

    try:
        assert resource["external_url"] == "https://example.com/study-guide"
        # follow_redirects=False: the API answers 302 with the external URL;
        # following it would leave the test server entirely.
        view = admin_client.get(f"/api/resources/{resource_id}/view", follow_redirects=False)
        assert view.status_code == 302
        assert view.headers["location"] == "https://example.com/study-guide"
    finally:
        admin_client.delete(f"/api/admin/resources/{resource_id}")


# ---------------------------------------------------------------------------
# Events CRUD
# ---------------------------------------------------------------------------


def test_event_crud_cycle(admin_client):
    created = admin_client.post(
        "/api/admin/events",
        data={
            "title": "Pytest Bac II Prep Livestream",
            "description": "pytest created event",
            "status": "upcoming",
            "location": "Online",
            "event_date": "2026-12-01T10:00",
            "cta_label": "Register",
            "cta_url": "https://example.com/register",
            "is_published": "true",
        },
    )
    assert created.status_code == 200, created.text
    event = created.json()
    event_id = event["id"]

    try:
        assert event["status"] == "upcoming"

        public_list = admin_client.get("/api/events/")
        assert any(e["id"] == event_id for e in public_list.json())

        updated = admin_client.put(
            f"/api/admin/events/{event_id}",
            data={
                "title": "Pytest Bac II Prep Livestream v2",
                "status": "live",
                "is_published": "true",
            },
        )
        assert updated.status_code == 200, updated.text
        assert updated.json()["status"] == "live"
    finally:
        deleted = admin_client.delete(f"/api/admin/events/{event_id}")
        assert deleted.status_code == 200

    assert admin_client.get(f"/api/events/{event_id}").status_code == 404


def test_event_rejects_invalid_status(admin_client):
    response = admin_client.post(
        "/api/admin/events",
        data={"title": "Pytest Bad Status Event", "status": "teleported"},
    )
    assert response.status_code == 400


def test_event_rejects_non_video_media(admin_client):
    response = admin_client.post(
        "/api/admin/events",
        data={"title": "Pytest Bad Media Event"},
        files={"media": ("pytest-media.pdf", make_pdf_bytes(), "application/pdf")},
    )
    assert response.status_code == 400
    assert "video" in response.json()["detail"]


# ---------------------------------------------------------------------------
# Security guard unit tests
# ---------------------------------------------------------------------------


def test_production_guard_blocks_placeholder_secret(monkeypatch):
    from app import main as app_main

    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@localhost/db")
    monkeypatch.setenv("SECRET_KEY", "change-this-secret-key")
    with pytest.raises(RuntimeError, match="Refusing to start"):
        app_main.ensure_safe_secret_key()


def test_local_placeholder_secret_only_warns(monkeypatch, capsys):
    from app import main as app_main

    monkeypatch.setenv("DATABASE_URL", "sqlite:///./whatever.db")
    monkeypatch.setenv("SECRET_KEY", "change-this-secret-key")
    app_main.ensure_safe_secret_key()  # must NOT raise
    assert "WARNING" in capsys.readouterr().out


def test_strong_secret_passes_guard(monkeypatch):
    from app import main as app_main

    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@localhost/db")
    monkeypatch.setenv("SECRET_KEY", "a-strong-production-secret-value-1234567890")
    app_main.ensure_safe_secret_key()  # must NOT raise


# ---------------------------------------------------------------------------
# Cloudinary round trip (mirrors the production storage path)
# ---------------------------------------------------------------------------


def test_cloudinary_upload_and_delete_roundtrip(admin_client, monkeypatch):
    """Uploads a tiny image through the API with STORAGE_BACKEND=cloudinary,
    verifies the public URL, then deletes it and verifies the asset is gone.
    Uses the real Cloudinary credentials configured in backend/.env."""
    monkeypatch.setenv("STORAGE_BACKEND", "cloudinary")

    created = admin_client.post(
        "/api/admin/resources/upload",
        data={
            "title": "Pytest Cloudinary Roundtrip",
            "grade_level": "12",
            "subject": "Physics",
            "file_type": "image",
            "category": "formula",
            "is_published": "true",
        },
        files={"file": ("pytest-cloudinary.png", make_png_bytes(), "image/png")},
    )
    assert created.status_code == 200, created.text
    resource = created.json()
    resource_id = resource["id"]
    file_path = resource["file_path"]

    try:
        assert re.match(r"^https://res\.cloudinary\.com/", file_path)
        # TestClient cannot fetch external URLs — use a real HTTP client.
        import time

        import httpx

        public_check = httpx.get(file_path, timeout=30)
        assert public_check.status_code == 200
        assert public_check.headers["content-type"].startswith("image/")
    finally:
        deleted = admin_client.delete(f"/api/admin/resources/{resource_id}")
        assert deleted.status_code == 200

    assert admin_client.get(f"/api/resources/{resource_id}").status_code == 404
    # Cloudinary invalidation is usually instant; allow brief propagation.
    import time

    import httpx

    for _ in range(4):
        after_delete = httpx.get(file_path, timeout=30)
        if after_delete.status_code == 404:
            break
        time.sleep(1.5)
    assert after_delete.status_code == 404
