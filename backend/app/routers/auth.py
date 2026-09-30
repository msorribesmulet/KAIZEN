import math
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response
from sqlmodel import Session, delete, select

from app.config import (
    COOKIE_SAMESITE,
    COOKIE_SECURE,
    CSRF_COOKIE_NAME,
    LOGIN_MAX_FAILURES,
    LOGIN_WINDOW_MINUTES,
    SESSION_COOKIE_NAME,
    SESSION_DAYS,
)
from app.database import get_session
from app.dependencies import as_utc, get_current_user
from app.models.user import FailedLogin, User, UserSession
from app.schemas.auth import Credentials, UserRead
from app.services.security import (
    decoy_hash,
    hash_password,
    hash_token,
    new_session_token,
    verify_password,
)

router = APIRouter(prefix="/auth")

LOGIN_WINDOW = timedelta(minutes=LOGIN_WINDOW_MINUTES)


def _record_attempt(email: str, session: Session) -> int | None:
    cutoff = datetime.now(timezone.utc) - LOGIN_WINDOW
    session.exec(
        delete(FailedLogin)
        .where(FailedLogin.created_at <= cutoff)
        .execution_options(synchronize_session=False)
    )
    attempt = FailedLogin(email=email)
    session.add(attempt)
    session.commit()
    session.refresh(attempt)
    return attempt.id


def _refuse_if_blocked(email: str, attempt_id: int | None, session: Session) -> None:
    now = datetime.now(timezone.utc)
    earlier = session.exec(
        select(FailedLogin.created_at)
        .where(
            FailedLogin.email == email,
            FailedLogin.id != attempt_id,
            FailedLogin.created_at > now - LOGIN_WINDOW,
        )
        .order_by(FailedLogin.created_at)
    ).all()
    if len(earlier) < LOGIN_MAX_FAILURES:
        return

    session.exec(
        delete(FailedLogin)
        .where(FailedLogin.id == attempt_id)
        .execution_options(synchronize_session=False)
    )
    session.commit()
    unblocked_at = as_utc(earlier[-LOGIN_MAX_FAILURES]) + LOGIN_WINDOW
    wait = max(1, math.ceil((unblocked_at - now).total_seconds()))
    raise HTTPException(
        status_code=429,
        detail="Too many failed attempts",
        headers={"Retry-After": str(wait)},
    )


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
    attempt_id = _record_attempt(credentials.email, session)
    _refuse_if_blocked(credentials.email, attempt_id, session)

    user = session.exec(select(User).where(User.email == credentials.email)).first()
    if not user:
        verify_password(credentials.password, decoy_hash())
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    session.exec(
        delete(FailedLogin)
        .where(FailedLogin.email == credentials.email)
        .execution_options(synchronize_session=False)
    )
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

    for name in (SESSION_COOKIE_NAME, CSRF_COOKIE_NAME):
        response.delete_cookie(
            name,
            path="/",
            secure=COOKIE_SECURE,
            samesite=COOKIE_SAMESITE,
        )

    return {"ok": True}


@router.get("/me", response_model=UserRead)
def me(user: User = Depends(get_current_user)) -> User:
    return user
