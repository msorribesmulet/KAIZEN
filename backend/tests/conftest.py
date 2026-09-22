import os

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.config import CSRF_COOKIE_NAME, CSRF_HEADER_NAME
from app.database import get_session
from app.main import app
from app.services import security

security.BCRYPT_ROUNDS = 4

CREDENTIALS = {"email": "marc@ejemplo.com", "password": "secreto123"}
OTHER_CREDENTIALS = {"email": "otra@ejemplo.com", "password": "secreto456"}


TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "")

if TEST_DATABASE_URL and "test" not in TEST_DATABASE_URL.rsplit("/", 1)[-1]:
    raise RuntimeError(
        "La suite borra todas las tablas antes de cada test. Por seguridad solo "
        "acepta una base cuyo nombre contenga 'test'. Recibido: "
        + TEST_DATABASE_URL.rsplit("/", 1)[-1]
    )


@pytest.fixture(name="session")
def session_fixture():
    if TEST_DATABASE_URL:
        engine = create_engine(TEST_DATABASE_URL)
        SQLModel.metadata.drop_all(engine)
    else:
        engine = create_engine(
            "sqlite://",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )

    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

    engine.dispose()


@pytest.fixture(name="make_client")
def make_client_fixture(session: Session):
    app.dependency_overrides[get_session] = lambda: session

    def make(credentials: dict | None = None) -> TestClient:
        client = TestClient(app, base_url="https://testserver")
        if credentials is not None:
            client.post("/auth/register", json=credentials)
            client.headers[CSRF_HEADER_NAME] = client.cookies[CSRF_COOKIE_NAME]
        return client

    yield make
    app.dependency_overrides.clear()


@pytest.fixture(name="anon_client")
def anon_client_fixture(make_client) -> TestClient:
    return make_client()


@pytest.fixture(name="client")
def client_fixture(make_client) -> TestClient:
    return make_client(CREDENTIALS)


@pytest.fixture(name="other_client")
def other_client_fixture(make_client) -> TestClient:
    return make_client(OTHER_CREDENTIALS)


@pytest.fixture(name="user_id")
def user_id_fixture(client: TestClient) -> int:
    return client.get("/auth/me").json()["id"]


@pytest.fixture(name="profile_payload")
def profile_payload_fixture() -> dict:
    return {
        "weight_kg": 78,
        "height_cm": 180,
        "age": 29,
        "sex": "male",
        "activity_level": "moderate",
        "goal": "lose",
        "kg_per_week": 0.5,
    }


@pytest.fixture(name="food_payload")
def food_payload_fixture() -> dict:
    return {
        "name": "Pechuga de pollo",
        "cal_100g": 165,
        "protein_100g": 31,
        "carbs_100g": 0,
        "fat_100g": 3.6,
    }
