from datetime import datetime, timedelta, timezone

from sqlmodel import select

from app.config import SESSION_COOKIE_NAME
from app.models.user import UserSession

CREDENTIALS = {"email": "marc@ejemplo.com", "password": "secreto123"}


class TestRegister:
    def test_creates_the_user_and_opens_the_session(self, client):
        response = client.post("/auth/register", json=CREDENTIALS)

        assert response.status_code == 201
        assert response.json()["email"] == "marc@ejemplo.com"
        assert client.get("/auth/me").status_code == 200

    def test_never_returns_the_password(self, client):
        body = client.post("/auth/register", json=CREDENTIALS).json()

        assert "password" not in body
        assert "password_hash" not in body

    def test_rejects_a_repeated_email(self, client):
        client.post("/auth/register", json=CREDENTIALS)

        assert client.post("/auth/register", json=CREDENTIALS).status_code == 409

    def test_the_email_is_case_insensitive(self, client):
        client.post("/auth/register", json=CREDENTIALS)
        shouting = {**CREDENTIALS, "email": "MARC@EJEMPLO.COM"}

        assert client.post("/auth/register", json=shouting).status_code == 409

    def test_the_cookie_cannot_be_read_by_javascript(self, client):
        response = client.post("/auth/register", json=CREDENTIALS)

        assert "httponly" in response.headers["set-cookie"].lower()


class TestLogin:
    def test_accepts_the_right_password(self, client):
        client.post("/auth/register", json=CREDENTIALS)
        client.post("/auth/logout")

        assert client.post("/auth/login", json=CREDENTIALS).status_code == 200

    def test_rejects_the_wrong_password(self, client):
        client.post("/auth/register", json=CREDENTIALS)
        client.post("/auth/logout")
        wrong = {**CREDENTIALS, "password": "otra_cosa"}

        assert client.post("/auth/login", json=wrong).status_code == 401

    def test_an_unknown_email_answers_like_a_wrong_password(self, client):
        unknown = {"email": "nadie@ejemplo.com", "password": "secreto123"}

        assert client.post("/auth/login", json=unknown).status_code == 401


class TestSession:
    def test_without_session_me_is_401(self, client):
        assert client.get("/auth/me").status_code == 401

    def test_logout_closes_the_session(self, client):
        client.post("/auth/register", json=CREDENTIALS)
        client.post("/auth/logout")

        assert client.get("/auth/me").status_code == 401

    def test_logout_deletes_the_session_from_the_database(self, client, session):
        client.post("/auth/register", json=CREDENTIALS)
        client.post("/auth/logout")

        assert session.exec(select(UserSession)).all() == []

    def test_an_expired_session_is_401(self, client, session):
        client.post("/auth/register", json=CREDENTIALS)
        stored = session.exec(select(UserSession)).one()
        stored.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
        session.add(stored)
        session.commit()

        assert client.get("/auth/me").status_code == 401

    def test_an_invented_token_is_401(self, client):
        client.cookies.set(SESSION_COOKIE_NAME, "esto-no-es-un-token")

        assert client.get("/auth/me").status_code == 401
