from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.dependencies import get_current_user
from app.models.profile import Profile
from app.models.user import User
from app.schemas.profile import ProfileCreate

router = APIRouter()


def _profile_of(user: User, session: Session) -> Profile | None:
    return session.exec(select(Profile).where(Profile.user_id == user.id)).first()


@router.get("/profile", response_model=Profile)
def get_profile(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    profile = _profile_of(user, session)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile


@router.post("/profile", response_model=Profile)
def create_profile(
    profile: ProfileCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    if _profile_of(user, session):
        raise HTTPException(status_code=409, detail="Profile already exists")

    new_profile = Profile(**profile.model_dump(), user_id=user.id)
    session.add(new_profile)
    session.commit()
    session.refresh(new_profile)

    return new_profile


@router.delete("/profile")
def delete_profile(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    profile = _profile_of(user, session)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    session.delete(profile)
    session.commit()

    return {"ok": True}


@router.put("/profile", response_model=Profile)
def upsert_profile(
    profile: ProfileCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    db_profile = _profile_of(user, session)

    if db_profile:
        db_profile.sqlmodel_update(profile.model_dump())
    else:
        db_profile = Profile(**profile.model_dump(), user_id=user.id)

    session.add(db_profile)
    session.commit()
    session.refresh(db_profile)

    return db_profile
