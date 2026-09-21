import pytest
from pydantic import ValidationError

from app.schemas.auth import Credentials
from app.services.security import (
    hash_password,
    hash_token,
    new_session_token,
    verify_password,
)


class TestPasswordHashing:
    def test_the_hash_is_not_the_password(self):
        assert hash_password("secreto123") != "secreto123"

    def test_accepts_the_right_password(self):
        assert verify_password("secreto123", hash_password("secreto123"))

    def test_rejects_the_wrong_password(self):
        assert not verify_password("otra_cosa", hash_password("secreto123"))

    def test_the_same_password_hashes_differently_each_time(self):
        assert hash_password("secreto123") != hash_password("secreto123")


class TestSessionTokens:
    def test_tokens_do_not_repeat(self):
        assert len({new_session_token() for _ in range(100)}) == 100

    def test_the_hash_of_a_token_is_stable(self):
        token = new_session_token()

        assert hash_token(token) == hash_token(token)

    def test_the_hash_is_not_the_token(self):
        token = new_session_token()

        assert hash_token(token) != token


class TestCredentials:
    def test_lowercases_and_trims_the_email(self):
        credentials = Credentials(email="  Marc@Ejemplo.COM ", password="secreto123")

        assert credentials.email == "marc@ejemplo.com"

    def test_rejects_a_malformed_email(self):
        with pytest.raises(ValidationError):
            Credentials(email="no-es-un-email", password="secreto123")

    def test_rejects_a_short_password(self):
        with pytest.raises(ValidationError):
            Credentials(email="marc@ejemplo.com", password="corta")

    def test_rejects_a_password_over_72_bytes(self):
        with pytest.raises(ValidationError):
            Credentials(email="marc@ejemplo.com", password="🔒" * 72)
