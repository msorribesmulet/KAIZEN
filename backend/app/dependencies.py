from datetime import datetime, timezone

from fastapi import Cookie, Depends, HTTPException
from sqlmodel import Session, select

from app.config import SESSION_COOKIE_NAME
from app.database import get_session
from app.models.user import User, UserSession
from app.services.security import hash_token


def as_utc(moment: datetime) -> datetime:
    return moment if moment.tzinfo else moment.replace(tzinfo=timezone.utc)


def get_current_user(
    token: str | None = Cookie(default=None, alias=SESSION_COOKIE_NAME),
    session: Session = Depends(get_session),
) -> User:
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    stored = session.exec(
        select(UserSession).where(UserSession.token_hash == hash_token(token))
    ).first()
    if not stored:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if as_utc(stored.expires_at) <= datetime.now(timezone.utc):
        session.delete(stored)
        session.commit()
        raise HTTPException(status_code=401, detail="Session expired")

    user = session.get(User, stored.user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    return user
