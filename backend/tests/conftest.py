import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.database import get_session
from app.main import app


@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    app.dependency_overrides[get_session] = lambda: session
    yield TestClient(app, base_url="https://testserver")
    app.dependency_overrides.clear()


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
