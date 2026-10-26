import os
import sys
import pytest
from datetime import timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.core.database import Base
from app.api.deps import get_db
from app.core.security import create_access_token
from app.db.base import *  # import all models
from app.db.seed_data import seed_database
from app.main import app

# Isolated in-memory SQLite database for tests
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_database(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def student_a_token():
    """Generates signed JWT token for Student A (Priya Sharma)."""
    payload = {
        "sub": "student-uuid-aaa-111",
        "email": "student.a@test.in",
        "role": "authenticated",
        "app_metadata": {"role": "student"},
        "user_metadata": {"full_name": "Student Alpha"},
    }
    return create_access_token(payload, expires_delta=timedelta(hours=2))

@pytest.fixture
def student_b_token():
    """Generates signed JWT token for Student B (Rahul Verma)."""
    payload = {
        "sub": "student-uuid-bbb-222",
        "email": "student.b@test.in",
        "role": "authenticated",
        "app_metadata": {"role": "student"},
        "user_metadata": {"full_name": "Student Beta"},
    }
    return create_access_token(payload, expires_delta=timedelta(hours=2))

@pytest.fixture
def admin_token():
    """Generates signed JWT token for Administrator."""
    payload = {
        "sub": "admin-uuid-999",
        "email": "admin@govexa.gov.in",
        "role": "authenticated",
        "app_metadata": {"role": "admin", "roles": ["admin"]},
        "user_metadata": {"full_name": "Senior Commission Officer"},
    }
    return create_access_token(payload, expires_delta=timedelta(hours=2))
