from typing import Annotated

from pydantic import AfterValidator, EmailStr, StringConstraints
from sqlmodel import SQLModel

from app.services.security import MAX_PASSWORD_BYTES


def _fits_bcrypt(password: str) -> str:
    if len(password.encode()) > MAX_PASSWORD_BYTES:
        raise ValueError(f"La contraseña no puede pasar de {MAX_PASSWORD_BYTES} bytes")
    return password


def _normalize(email: str) -> str:
    return email.strip().lower()


Email = Annotated[EmailStr, AfterValidator(_normalize)]
Password = Annotated[str, StringConstraints(min_length=8), AfterValidator(_fits_bcrypt)]


class Credentials(SQLModel):
    email: Email
    password: Password


class UserRead(SQLModel):
    id: int
    email: str
