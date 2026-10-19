"""Isolated test environment for the E-Learning API test suite.

Environment variables are set BEFORE importing the app so that
load_dotenv() (which reads backend/.env) can never override them:
load_dotenv only fills variables that are not already set.

The suite runs against a temporary SQLite database and local file
storage, so production data in Neon and Cloudinary is never touched
by the CRUD tests.
"""

import os
import tempfile

_TEST_DIR = tempfile.mkdtemp(prefix="elearning-pytest-")

os.environ["DATABASE_URL"] = f"sqlite:///{_TEST_DIR}/test-e-learning.db"
os.environ["STORAGE_BACKEND"] = "local"
os.environ["SECRET_KEY"] = "pytest-secret-key-0f8b2c9d1e7a6b3f5c0d9e8a7b6c5d4e"
os.environ["ADMIN_NAME"] = "Pytest Admin"
os.environ["ADMIN_EMAIL"] = "pytest-admin@test.local"
os.environ["ADMIN_PASSWORD"] = "pytest-password-123"
os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "60"

import io  # noqa: E402

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from PIL import Image  # noqa: E402

from app.main import app  # noqa: E402


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture(scope="session")
def admin_client(client):
    response = client.post(
        "/api/auth/login",
        json={
            "email": os.environ["ADMIN_EMAIL"],
            "password": os.environ["ADMIN_PASSWORD"],
        },
    )
    assert response.status_code == 200, response.text
    return client


def make_pdf_bytes(content: str = "pytest test document") -> bytes:
    return b"%PDF-1.4\n" + content.encode("utf-8") + b"\n%%EOF\n"


def make_png_bytes(color=(255, 107, 136), size=(16, 16)) -> bytes:
    buffer = io.BytesIO()
    Image.new("RGB", size, color).save(buffer, format="PNG")
    return buffer.getvalue()
