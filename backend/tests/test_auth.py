from datetime import datetime, timedelta, timezone

from sqlmodel import select

from app.config import (
    CSRF_COOKIE_NAME,
    CSRF_HEADER_NAME,
    FRONTEND_URL,
    SESSION_COOKIE_NAME,
)
from app.models.user import UserSession
from app.routers import auth as auth_router

CREDENTIALS = {"email": "marc@ejemplo.com", "password": "secreto123"}


def register(client) -> None:
    client.post("/auth/register", json=CREDENTIALS)
    client.headers[CSRF_HEADER_NAME] = client.cookies[CSRF_COOKIE_NAME]


class TestRegister:
    def test_creates_the_user_and_opens_the_session(self, anon_client):
        response = anon_client.post("/auth/register", json=CREDENTIALS)

        assert response.status_code == 201
        assert response.json()["email"] == "marc@ejemplo.com"
        assert anon_client.get("/auth/me").status_code == 200

    def test_never_returns_the_password(self, anon_client):
        body = anon_client.post("/auth/register", json=CREDENTIALS).json()

        assert "password" not in body
        assert "password_hash" not in body

    def test_rejects_a_repeated_email(self, anon_client):
        anon_client.post("/auth/register", json=CREDENTIALS)

        assert anon_client.post("/auth/register", json=CREDENTIALS).status_code == 409

    def test_the_email_is_case_insensitive(self, anon_client):
        anon_client.post("/auth/register", json=CREDENTIALS)
        shouting = {**CREDENTIALS, "email": "MARC@EJEMPLO.COM"}

        assert anon_client.post("/auth/register", json=shouting).status_code == 409

    def test_the_cookie_cannot_be_read_by_javascript(self, anon_client):
        response = anon_client.post("/auth/register", json=CREDENTIALS)

        assert "httponly" in response.headers["set-cookie"].lower()


class TestLogin:
    def test_accepts_the_right_password(self, anon_client):
        register(anon_client)
        anon_client.post("/auth/logout")

        assert anon_client.post("/auth/login", json=CREDENTIALS).status_code == 200

    def test_rejects_the_wrong_password(self, anon_client):
        register(anon_client)
        anon_client.post("/auth/logout")
        wrong = {**CREDENTIALS, "password": "otra_cosa"}

        assert anon_client.post("/auth/login", json=wrong).status_code == 401

    def test_an_unknown_email_answers_like_a_wrong_password(self, anon_client):
        unknown = {"email": "nadie@ejemplo.com", "password": "secreto123"}

        assert anon_client.post("/auth/login", json=unknown).status_code == 401

    def test_an_unknown_email_still_verifies_a_password(self, anon_client, monkeypatch):
        checked = []
        monkeypatch.setattr(
            auth_router,
            "verify_password",
            lambda *args: bool(checked.append(args)) and False,
        )
        unknown = {"email": "nadie@ejemplo.com", "password": "secreto123"}

        anon_client.post("/auth/login", json=unknown)

        assert checked


class TestSession:
    def test_without_session_me_is_401(self, anon_client):
        assert anon_client.get("/auth/me").status_code == 401

    def test_logout_closes_the_session(self, anon_client):
        register(anon_client)
        anon_client.post("/auth/logout")

        assert anon_client.get("/auth/me").status_code == 401

    def test_logout_deletes_the_cookies_the_way_they_were_set(self, client):
        response = client.post("/auth/logout")
        deleted = response.headers.get_list("set-cookie")

        assert len(deleted) == 2
        assert all("secure" in value.lower() for value in deleted)

    def test_logout_deletes_the_session_from_the_database(self, anon_client, session):
        register(anon_client)
        anon_client.post("/auth/logout")

        assert session.exec(select(UserSession)).all() == []

    def test_an_expired_session_is_401(self, anon_client, session):
        register(anon_client)
        stored = session.exec(select(UserSession)).one()
        stored.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
        session.add(stored)
        session.commit()

        assert anon_client.get("/auth/me").status_code == 401

    def test_an_invented_token_is_401(self, anon_client):
        anon_client.cookies.set(SESSION_COOKIE_NAME, "esto-no-es-un-token")

        assert anon_client.get("/auth/me").status_code == 401


class TestCsrf:
    def test_writing_without_the_header_is_403(self, client, food_payload):
        del client.headers[CSRF_HEADER_NAME]

        assert client.post("/foods", json=food_payload).status_code == 403

    def test_a_header_that_does_not_match_the_cookie_is_403(self, client, food_payload):
        client.headers[CSRF_HEADER_NAME] = "valor-inventado"

        assert client.post("/foods", json=food_payload).status_code == 403

    def test_a_non_ascii_header_is_403_and_not_500(self, client, food_payload):
        raw = {CSRF_HEADER_NAME.lower().encode(): b"\xf1o\xf1o"}

        response = client.post("/foods", json=food_payload, headers=raw)

        assert response.status_code == 403

    def test_the_rejection_carries_cors_headers(self, client, food_payload):
        client.headers[CSRF_HEADER_NAME] = "valor-inventado"

        response = client.post(
            "/foods", json=food_payload, headers={"Origin": FRONTEND_URL}
        )

        assert response.status_code == 403
        assert response.headers["access-control-allow-origin"] == FRONTEND_URL

    def test_logout_works_without_the_header(self, client):
        del client.headers[CSRF_HEADER_NAME]

        assert client.post("/auth/logout").status_code == 200

    def test_reading_does_not_need_the_header(self, client):
        del client.headers[CSRF_HEADER_NAME]

        assert client.get("/foods").status_code == 200

    def test_the_csrf_cookie_is_readable_by_javascript(self, anon_client):
        response = anon_client.post("/auth/register", json=CREDENTIALS)
        csrf = [
            value
            for value in response.headers.get_list("set-cookie")
            if value.startswith(f"{CSRF_COOKIE_NAME}=")
        ]

        assert len(csrf) == 1
        assert "httponly" not in csrf[0].lower()
