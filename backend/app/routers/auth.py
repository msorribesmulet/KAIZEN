from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from sqlmodel import Session, select

from app.config import (
    COOKIE_SAMESITE,
    COOKIE_SECURE,
    CSRF_COOKIE_NAME,
    SESSION_COOKIE_NAME,
    SESSION_DAYS,
)
from app.database import get_session
from app.dependencies import get_current_user
from app.models.user import User, UserSession
from app.schemas.auth import Credentials, UserRead
from app.services.security import (
    hash_password,
    hash_token,
    new_session_token,
    verify_password,
)

router = APIRouter(prefix="/auth")


def _open_session(user: User, response: Response, session: Session) -> None:
    token = new_session_token()
    response.set_cookie(
        key=CSRF_COOKIE_NAME,
        value=new_session_token(),
        httponly=False,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=SESSION_DAYS * 24 * 60 * 60,
        path="/",
    )
    session.add(
        UserSession(
            user_id=user.id,
            token_hash=hash_token(token),
            expires_at=datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS),
        )
    )
    session.commit()
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        max_age=SESSION_DAYS * 24 * 60 * 60,
        path="/",
    )


@router.post("/register", response_model=UserRead, status_code=201)
def register(
    credentials: Credentials,
    response: Response,
    session: Session = Depends(get_session),
) -> User:
    taken = session.exec(select(User).where(User.email == credentials.email)).first()
    if taken:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        email=credentials.email,
        password_hash=hash_password(credentials.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    _open_session(user, response, session)

    return user


@router.post("/login", response_model=UserRead)
def login(
    credentials: Credentials,
    response: Response,
    session: Session = Depends(get_session),
) -> User:
    user = session.exec(select(User).where(User.email == credentials.email)).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    _open_session(user, response, session)

    return user


@router.post("/logout")
def logout(
    response: Response,
    token: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
    session: Session = Depends(get_session),
) -> dict:
    if token:
        stored = session.exec(
            select(UserSession).where(UserSession.token_hash == hash_token(token))
        ).first()
        if stored:
            session.delete(stored)
            session.commit()

    response.delete_cookie(SESSION_COOKIE_NAME, path="/")
    response.delete_cookie(CSRF_COOKIE_NAME, path="/")

    return {"ok": True}


@router.get("/me", response_model=UserRead)
def me(user: User = Depends(get_current_user)) -> User:
    return user
