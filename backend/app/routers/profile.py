from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models.profile import Profile
from app.schemas.profile import ProfileCreate

router = APIRouter()


@router.get("/profile")
def get_profile(session: Session = Depends(get_session)):
    profile = session.exec(select(Profile)).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@router.post("/profile")
def create_profile(profile: ProfileCreate, session: Session = Depends(get_session)):
    existing = session.exec(select(Profile)).first()
    if existing:
        raise HTTPException(status_code=409, detail="Profile already exists")

    new_profile = Profile(
        weight_kg=profile.weight_kg,
        height_cm=profile.height_cm,
        age=profile.age,
        sex=profile.sex,
        activity_level=profile.activity_level,
        goal=profile.goal,
        kg_per_week=profile.kg_per_week,
    )
    session.add(new_profile)
    session.commit()
    session.refresh(new_profile)
    return new_profile


@router.delete("/profile/{profile_id}")
def delete_profile(profile_id: int, session: Session = Depends(get_session)):
    profile = session.get(Profile, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    session.delete(profile)
    session.commit()
    return {"ok": True}


@router.put("/profile/{profile_id}")
def update_profile(
    profile_id: int, profile: ProfileCreate, session: Session = Depends(get_session)
):
    db_profile = session.get(Profile, profile_id)
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    db_profile.weight_kg = profile.weight_kg
    db_profile.height_cm = profile.height_cm
    db_profile.age = profile.age
    db_profile.sex = profile.sex
    db_profile.activity_level = profile.activity_level
    db_profile.goal = profile.goal
    db_profile.kg_per_week = profile.kg_per_week
    session.add(db_profile)
    session.commit()
    session.refresh(db_profile)
    return db_profile
